import styled from 'styled-components';

export const QuillsContainer = styled.div`
  body {
    background: #f3f1f2;
    font-family: sans-serif;
  }

  #root {
    margin: 1rem 4rem;
  }

  #root .ql-container {
    border-bottom-left-radius: 0.5em;
    border-bottom-right-radius: 0.5em;
    background: #fefcfc;
  }

  /* Snow Theme */
  #root .ql-snow.ql-toolbar {
    display: block;
    background: #eaecec;
    border-top-left-radius: 0.5em;
    border-top-right-radius: 0.5em;
  }

  #root .ql-editor {
    min-height: 18em;
  }
`;

export const InputsWrapper = styled.div`
  width: 60%
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;
