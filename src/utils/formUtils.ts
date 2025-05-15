/**
 * Utility functions for working with different form libraries
 */

/**
 * Safely sets a value on a form field, compatible with multiple form libraries
 * @param formRef The reference to the form
 * @param fieldName The name of the field to set
 * @param value The value to set
 */
export const safeSetFormValue = (
  formRef: React.RefObject<any> | undefined,
  fieldName: string,
  value: any
): void => {
  if (!formRef || !formRef.current) return;

  // Handle Ant Design form
  if (typeof formRef.current.setFieldsValue === 'function') {
    formRef.current.setFieldsValue({ [fieldName]: value });
    return;
  }

  // Handle React Hook Form
  if (typeof formRef.current.setValue === 'function') {
    formRef.current.setValue(fieldName, value);
    return;
  }

  // Handle Mantine form
  if (typeof formRef.current.setFieldValue === 'function') {
    formRef.current.setFieldValue(fieldName, value);
    return;
  }

  // Check if the current ref is an HTML form element
  if (formRef.current instanceof HTMLFormElement) {
    // Try to find the form element and set its value
    const element = formRef.current.elements.namedItem(fieldName);
    if (element && 'value' in element) {
      // @ts-ignore - TypeScript doesn't know element has a value property
      element.value = value;
    } else {
      console.warn(`Could not find form element with name: ${fieldName}`);
    }
    return;
  }

  // Last resort - try to set property directly on the object
  try {
    formRef.current[fieldName] = value;
  } catch (error) {
    console.warn(`Failed to set value for field ${fieldName}:`, error);
  }
};

/**
 * Safely sets multiple values on a form, compatible with multiple form libraries
 * @param formRef The reference to the form
 * @param values Object containing field names and values to set
 */
export const safeSetFormValues = (
  formRef: React.RefObject<any> | undefined,
  values: Record<string, any>
): void => {
  if (!formRef || !formRef.current) return;
  if (typeof formRef.current.setFieldsValue === 'function') {
    formRef.current.setFieldsValue(values);
  } else {
    Object.entries(values).forEach(([key, value]) => {
      console.log(key, value);
      safeSetFormValue(formRef, key, value);
    });
  }
  console.log(formRef.current);
};

/**
 * Safely validates a form regardless of the form library being used
 * @param formRef Reference to the form
 * @returns Promise that resolves with the form values if validation passes
 */
export const safeValidateForm = async (formRef: React.RefObject<any> | undefined): Promise<any> => {
  if (!formRef || !formRef.current) {
    throw new Error('Form reference is not available');
  }

  // Handle Ant Design form validation
  if (typeof formRef.current.validateFields === 'function') {
    return formRef.current.validateFields();
  }

  // Handle Mantine form validation
  if (formRef.current.validate) {
    const validation = await formRef.current.validate();

    // If Mantine form validation has errors
    if (validation.hasErrors) {
      // Get the first error message to display to the user
      let errorMessage = 'Form validation failed';
      for (const field in validation.errors) {
        if (validation.errors[field]) {
          errorMessage = validation.errors[field];
          break;
        }
      }
      throw new Error(errorMessage);
    }

    // Return the form values if validation passes
    return formRef.current.values;
  }

  // Handle React Hook Form validation
  if (typeof formRef.current.handleSubmit === 'function') {
    return new Promise((resolve, reject) => {
      formRef.current.handleSubmit(resolve, (errors) => {
        reject(new Error('Form validation failed'));
      })();
    });
  }

  // If no known validation method is found, try to return the values directly
  if (formRef.current.values) {
    return formRef.current.values;
  }

  throw new Error('No validation method found for this form library');
};

/**
 * Safely gets a value from a form, compatible with multiple form libraries
 * @param formRef The reference to the form
 * @param fieldName The name of the field to get
 * @param defaultValue Optional default value if the field is not found
 */
export const getFormValue = (
  formRef: React.RefObject<any> | undefined,
  fieldName: string,
  defaultValue: any = ''
): any => {
  if (!formRef || !formRef.current) return defaultValue;

  // Handle Mantine form
  if (formRef.current.values && fieldName in formRef.current.values) {
    return formRef.current.values[fieldName];
  }

  // Handle Ant Design form
  if (typeof formRef.current.getFieldValue === 'function') {
    const value = formRef.current.getFieldValue(fieldName);
    return value !== undefined ? value : defaultValue;
  }

  // Handle React Hook Form
  if (typeof formRef.current.getValues === 'function') {
    const values = formRef.current.getValues();
    return values[fieldName] !== undefined ? values[fieldName] : defaultValue;
  }

  // Handle direct property access
  if (fieldName in formRef.current) {
    return formRef.current[fieldName] !== undefined ? formRef.current[fieldName] : defaultValue;
  }

  // Handle HTML form elements
  if (formRef.current instanceof HTMLFormElement) {
    const element = formRef.current.elements.namedItem(fieldName);
    if (element && 'value' in element) {
      // @ts-ignore
      return element.value;
    }
  }

  return defaultValue;
};