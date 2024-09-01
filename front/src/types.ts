export interface Question {
    question: string;
    choices: string[];
    answer: string;
  }
  
  export interface EnhancePromptRequest {
    currentSysPrompt: string;
    previousSysPrompt: string;
    questions: Question[];
  }
  
  export interface EnhancePromptResponse {
    newSysPrompt: string;
    questions: Question[];
  }