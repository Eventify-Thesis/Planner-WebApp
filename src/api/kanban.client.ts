import { IdParam } from '@/types/types';
import { httpApi } from './http.api';

export interface KanbanColumn {
  id: number;
  boardId: number;
  name: string;
  position: number;
}

export type TaskPriority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';
export type TaskLabel = 'bug' | 'feature' | 'improvement' | 'documentation' | 'task';

export interface KanbanTask {
  id: number;
  columnId: number;
  title: string;
  description: string | null;
  position: number;
  dueDate: Date | null;
  priority?: TaskPriority; // Added for frontend use only
  labels?: TaskLabel[]; // Added for frontend use only
}

export interface TaskAssignment {
  id: number;
  taskId: number;
  memberId: string;
}

export interface Member {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  role: string;
}

export interface CreateKanbanTaskDto {
  columnId: number;
  title: string;
  description?: string;
  position: number;
  dueDate?: Date;
  assignees?: string[];
  priority?: TaskPriority;
  labels?: TaskLabel[];
}

export interface UpdateKanbanTaskDto {
  title?: string;
  description?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  labels?: TaskLabel[];
}

export interface UpdateTaskPositionDto {
  columnId?: number;
  position: number;
}

export interface UpdateTaskAssignmentsDto {
  assignees: string[];
}

export interface CreateKanbanColumnDto {
  name: string;
  position?: number;
}

export interface UpdateKanbanColumnDto {
  name?: string;
  position?: number;
}



export const kanbanClient = {
  createBoard: async (eventId: IdParam): Promise<any> => {
    try {
      const response = await httpApi.post<any>(`/planner/events/${eventId}/kanban/board`);
      return response.data.data.result || response.data.data;
    } catch (e: any) {
      console.error('Error creating kanban board:', e);
      throw new Error(e);
    }
  },

  createColumn: async (eventId: IdParam, data: CreateKanbanColumnDto): Promise<any> => {
    try {
      const response = await httpApi.post<any>(`/planner/events/${eventId}/kanban/columns`, data);
      return response.data.data.result || response.data.data;
    } catch (e: any) {
      console.error('Error creating kanban column:', e);
      throw new Error(e);
    }
  },

  deleteColumn: async (eventId: IdParam, columnId: IdParam): Promise<any> => {
    try {
      const response = await httpApi.delete<any>(`/planner/events/${eventId}/kanban/columns/${columnId}`);
      return response.data.data.result || response.data.data;
    } catch (e: any) {
      console.error('Error deleting kanban column:', e);
      throw new Error(e);
    }
  },

  updateColumn: async (eventId: IdParam, columnId: IdParam, data: UpdateKanbanColumnDto): Promise<any> => {
    try {
      const response = await httpApi.put<any>(`/planner/events/${eventId}/kanban/columns/${columnId}`, data);
      return response.data.data.result || response.data.data;
    } catch (e: any) {
      console.error('Error updating kanban column:', e);
      throw new Error(e);
    }
  },



  getColumns: async (eventId: IdParam): Promise<KanbanColumn[]> => {
    try {
      const response = await httpApi.get<any>(`/planner/events/${eventId}/kanban/columns`);
      return response.data.data.result || [];
    } catch (e: any) {
      console.error('Error fetching kanban columns:', e);
      throw new Error(e);
    }
  },

  getTasks: async (eventId: IdParam): Promise<KanbanTask[]> => {
    try {
      const response = await httpApi.get<any>(`/planner/events/${eventId}/kanban/tasks`);
      return response.data.data.result || [];
    } catch (e: any) {
      console.error('Error fetching kanban tasks:', e);
      throw new Error(e);
    }
  },

  getAssignments: async (eventId: IdParam): Promise<TaskAssignment[]> => {
    try {
      const response = await httpApi.get<any>(`/planner/events/${eventId}/kanban/assignments`);
      return response.data.data.result || [];
    } catch (e: any) {
      console.error('Error fetching task assignments:', e);
      throw new Error(e);
    }
  },

  createTask: async (eventId: IdParam, task: CreateKanbanTaskDto): Promise<KanbanTask> => {
    try {
      const response = await httpApi.post<any>(`/planner/events/${eventId}/kanban/tasks`, task);
      return response.data.data;
    } catch (e: any) {
      console.error('Error creating kanban task:', e);
      throw new Error(e);
    }
  },

  updateTask: async (eventId: IdParam, taskId: IdParam, task: UpdateKanbanTaskDto): Promise<KanbanTask> => {
    try {
      const response = await httpApi.put<any>(`/planner/events/${eventId}/kanban/tasks/${taskId}`, task);
      return response.data.data.result;
    } catch (e: any) {
      console.error('Error updating kanban task:', e);
      throw new Error(e);
    }
  },

  updateTaskPosition: async (eventId: IdParam, taskId: IdParam, position: UpdateTaskPositionDto): Promise<KanbanTask> => {
    try {
      const response = await httpApi.put<any>(`/planner/events/${eventId}/kanban/tasks/${taskId}/position`, position);
      return response.data.data.result;
    } catch (e: any) {
      console.error('Error updating task position:', e);
      throw new Error(e);
    }
  },

  updateTaskAssignments: async (eventId: IdParam, taskId: IdParam, assignments: UpdateTaskAssignmentsDto): Promise<any> => {
    try {
      const response = await httpApi.put<any>(`/planner/events/${eventId}/kanban/tasks/${taskId}/assignments`, assignments);
      return response.data.data.result;
    } catch (e: any) {
      console.error('Error updating task assignments:', e);
      throw new Error(e);
    }
  },

  deleteTask: async (eventId: IdParam, taskId: IdParam): Promise<any> => {
    try {
      const response = await httpApi.delete<any>(`/planner/events/${eventId}/kanban/tasks/${taskId}`);
      return response.data.data.result;
    } catch (e: any) {
      console.error('Error deleting kanban task:', e);
      throw new Error(e);
    }
  }
};
