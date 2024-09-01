import './App.css'
import { useState, useRef, useEffect } from 'react'
import { Slider, ToggleButtonGroup, ToggleButton, Button } from '@mui/material'
import { EnhancePromptRequest, EnhancePromptResponse, Question } from './types';

export default function App() {
  const [answers, setAnswers] = useState<{ [key: number]: string | number }>({})
  const [visitedRows, setVisitedRows] = useState({})
  const [focusedRowIndex, setFocusedRowIndex] = useState(0)
  const [systemInstruction, setSystemInstruction] = useState('')
  const [backendStatus, setBackendStatus] = useState('Unknown')
  const [lastCheckTime, setLastCheckTime] = useState(null)
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "What's your favorite color?",
      options: ["Red", "Blue", "Green", "Yellow"]
    },
    {
      id: 2,
      text: "How often do you exercise?",
      options: ["Daily", "Weekly", "Monthly", "Rarely"]
    },
    {
      id: 3,
      text: "On a scale of 1-10, how satisfied are you with our service?",
      type: "slider",
      min: 1,
      max: 10,
      step: 1
    },
    {
      id: 4,
      text: "How would you rate your experience?",
      type: "toggle",
      options: ["Poor", "Average", "Excellent"]
    }
  ])
  const rowRefs = useRef([])
  const submitButtonRef = useRef(null)

  useEffect(() => {
    // Initialize answers with first option for radio button questions
    const initialAnswers = questions.reduce((acc, question) => {
      if (!question.type || question.type === 'radio') {
        acc[question.id] = question.options[0]
      } else if (question.type === 'slider') {
        acc[question.id] = question.min
      }
      return acc
    }, {})
    setAnswers(prev => ({ ...prev, ...initialAnswers }))

    // Focus on the first question
    if (rowRefs.current[0]) {
      rowRefs.current[0].focus()
    }
  }, [])

  const handleOptionChange = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }))
    setVisitedRows(prev => ({ ...prev, [questionId]: true }))
  }

  const handleSliderChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    setVisitedRows(prev => ({ ...prev, [questionId]: true }))
  }

  const handleToggleChange = (questionId, _, newValue) => {
    if (newValue !== null) {
      setAnswers(prev => ({ ...prev, [questionId]: newValue }))
      setVisitedRows(prev => ({ ...prev, [questionId]: true }))
    }
  }

  const handleKeyDown = (event, question, index) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (index < questions.length - 1) {
        const nextIndex = index + 1
        setFocusedRowIndex(nextIndex)
        rowRefs.current[nextIndex].focus()
        const nextQuestion = questions[nextIndex]
        if (!visitedRows[nextQuestion.id] && (!nextQuestion.type || nextQuestion.type === 'radio')) {
          handleOptionChange(nextQuestion.id, answers[nextQuestion.id] || nextQuestion.options[0])
        }
      } else {
        setFocusedRowIndex(questions.length)
        submitButtonRef.current.focus()
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (index > 0) {
        const prevIndex = index - 1
        setFocusedRowIndex(prevIndex)
        rowRefs.current[prevIndex].focus()
        const prevQuestion = questions[prevIndex]
        if (!visitedRows[prevQuestion.id] && (!prevQuestion.type || prevQuestion.type === 'radio')) {
          handleOptionChange(prevQuestion.id, answers[prevQuestion.id] || prevQuestion.options[0])
        }
      }
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      if (question.type === 'slider') {
        const currentValue = answers[question.id] || question.min
        const step = question.step || 1
        const newValue = event.key === 'ArrowRight'
          ? Math.min(currentValue + step, question.max)
          : Math.max(currentValue - step, question.min)
        handleSliderChange(question.id, newValue)
      } else if (question.options) {
        const currentIndex = question.options.indexOf(answers[question.id])
        const nextIndex = event.key === 'ArrowRight' 
          ? (currentIndex + 1) % question.options.length
          : (currentIndex - 1 + question.options.length) % question.options.length
        handleToggleChange(question.id, null, question.options[nextIndex])
      }
    }
  }

  const handleSubmitKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setFocusedRowIndex(questions.length - 1)
      rowRefs.current[questions.length - 1].focus()
    }
  }

  const handleSubmit = () => {
    console.log('Submit clicked', { systemInstruction, answers })
    // Here you would typically send a POST request
    // For now, we'll just log the data and provide visual feedback

    // Visual feedback
    if (submitButtonRef.current) {
      submitButtonRef.current.style.backgroundColor = '#2c387e'
      setTimeout(() => {
        submitButtonRef.current.style.backgroundColor = ''
      }, 200)
    }
  }

  const handleMainClick = (event) => {
    // Only prevent default and focus if clicking outside of inputs
    if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
      event.preventDefault()
      if (focusedRowIndex < questions.length) {
        rowRefs.current[focusedRowIndex].focus()
      } else {
        submitButtonRef.current.focus()
      }
    }
  }

  const handleSystemInstructionChange = (event) => {
    setSystemInstruction(event.target.value)
  }

  const handleEnhancePrompt = async () => {
    try {
      const requestBody: EnhancePromptRequest = {
        currentSysPrompt: systemInstruction,
        previousSysPrompt: '', // Add logic to get the previous system prompt if needed
        questions: questions?.map(q => ({
          question: q.text || '',
          choices: q.options || [], // Ensure choices is always an array
          answer: String(answers[q.id] || '')
        })) || []
      };

      const response = await fetch('/api/enhance-prompt-v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: EnhancePromptResponse = await response.json();
      console.log('Enhanced prompt response:', data);

      if (data.questions) {
        setQuestions(data.questions);
      } else {
        console.error('No questions returned from enhance prompt response');
      }

      setAnswers({});
      setVisitedRows({});
      setFocusedRowIndex(0);
    } catch (error) {
      console.error('Error enhancing prompt:', error);
    }
  };

  const handleHealthCheck = async () => {
    console.log("Health check button pressed");
    try {
      console.log("Sending request to /api/healthcheck");
      const response = await fetch('/api/healthcheck', {
        method: 'GET',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const text = await response.text();
      console.log('Response text:', text);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      const data = JSON.parse(text);
      console.log('Health check result:', data);
      
      setBackendStatus('Alive')
      setLastCheckTime(new Date().toLocaleString())
    } catch (error) {
      console.error('Error during health check:', error);
      setBackendStatus('Down')
      setLastCheckTime(new Date().toLocaleString())
    }
  };
  
  const valuetext = (value: number) => {
    return `${value}°C`;
  }

  const [inferenceStatus, setInferenceStatus] = useState('Unknown')
  const [inferenceResponse, setInferenceResponse] = useState('')

  const handleInferenceHealthCheck = async () => {
    console.log("Inference health check button pressed");
    try {
      console.log("Sending request to /api/healthcheck-inference");
      const response = await fetch('/api/healthcheck-inference', {
        method: 'GET',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Inference health check result:', data);

      if (!response.ok) {
        throw new Error(`Inference health check failed: ${response.status} ${response.statusText}`);
      }

      setInferenceStatus('Healthy')
      setInferenceResponse(data.response)
    } catch (error) {
      console.error('Error during inference health check:', error);
      setInferenceStatus('Unhealthy')
      setInferenceResponse(error.message)
    }
  };

  return (
    <main onMouseDown={handleMainClick} style={{ userSelect: 'none' }}>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p><strong>Hint:</strong> Use left and right arrow keys to select options. Use up and down arrow keys to move between questions. Press Enter to submit when the button is focused.</p>
      </div>

      <div>
        <label htmlFor="systemInstruction">System Instruction:</label>
        <br />
        <textarea
          id="systemInstruction"
          name="systemInstruction"
          value={systemInstruction}
          onChange={handleSystemInstructionChange}
          placeholder="Enter system instruction"
          style={{
            width: '100%',
            height: '5em',
            marginTop: '5px'
          }}
        />
      </div>
      
      <div style={{ marginTop: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleEnhancePrompt}
        >
          Enhance the prompt
        </Button>
      </div>

      <table style={{ marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Question</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Options</th>
          </tr>
        </thead>
        <tbody>
          {questions && questions.map((question, index) => (
            <tr 
              key={question.id} 
              ref={el => rowRefs.current[index] = el} 
              tabIndex={0}
              onKeyDown={(event) => handleKeyDown(event, question, index)}
              style={{ 
                outline: 'none',
                backgroundColor: index === focusedRowIndex ? '#e6f2ff' : 'transparent'
              }}
            >
              <td style={{ border: '1px solid black', padding: '8px' }}>{question.text}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>
                {question.type === 'slider' ? (
                  <Slider
                    value={answers[question.id] || question.min}
                    onChange={(_, value) => handleSliderChange(question.id, value)}
                    valueLabelDisplay="auto"
                    step={question.step}
                    marks
                    min={question.min}
                    max={question.max}
                    style={{ width: '200px' }}
                  />
                ) : question.type === 'toggle' ? (
                  <ToggleButtonGroup
                    value={answers[question.id] || null}
                    exclusive
                    onChange={(event, newValue) => handleToggleChange(question.id, event, newValue)}
                    aria-label={question.text}
                  >
                    {question.options?.map(option => (
                      <ToggleButton key={option} value={option} aria-label={option}>
                        {option}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                ) : (
                  question.options?.map(option => (
                    <label key={option} style={{ marginRight: '10px' }}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleOptionChange(question.id, option)}
                      />
                      {option}
                    </label>
                  ))
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px', width: '300px' }}>
        <Button
          ref={submitButtonRef}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          onKeyDown={handleSubmitKeyDown}
          style={{ 
            width: '100%',
            outline: 'none',
            boxShadow: focusedRowIndex === questions.length ? '0 0 0 2px #3f51b5' : 'none',
            transition: 'background-color 0.2s'
          }}
        >
          Submit
        </Button>
        
      </div>

      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleHealthCheck}
        >
          Health Check
        </Button>
        <div style={{ marginLeft: '20px' }}>
          Backend Status: {backendStatus}
          {lastCheckTime && ` (Last checked: ${lastCheckTime})`}
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleInferenceHealthCheck}
        >
          Inference Health Check
        </Button>
        <div style={{ marginLeft: '20px' }}>
          Inference Status: {inferenceStatus}
          {inferenceResponse && ` (Response: ${inferenceResponse})`}
        </div>
      </div>

      <p>For questions or feedback please contact at adix@adixstudios.com</p>
    </main>
  )
}