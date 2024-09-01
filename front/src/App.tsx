import './App.css'
import { useState, useRef, useEffect } from 'react'
import { Slider, ToggleButtonGroup, ToggleButton, Button } from '@mui/material'

export default function App() {
  const [answers, setAnswers] = useState({})
  const [visitedRows, setVisitedRows] = useState({})
  const [focusedRowIndex, setFocusedRowIndex] = useState(0)
  const [systemInstruction, setSystemInstruction] = useState('')
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
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: systemInstruction }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      
      // Assuming the API returns an array of question objects
      // Each object should have { id, text, type, options } properties
      setQuestions(data.questions)
      
      // Reset answers and visited rows for new questions
      setAnswers({})
      setVisitedRows({})
      setFocusedRowIndex(0)
    } catch (error) {
      console.error('Error enhancing prompt:', error)
      // You might want to show an error message to the user here
    }
  }

  const valuetext = (value: number) => {
    return `${value}°C`;
  }

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
      
      <div style={{ marginTop: '10px', marginBottom: '20px' }}>
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
          {questions.map((question, index) => (
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
                    {question.options.map(option => (
                      <ToggleButton key={option} value={option} aria-label={option}>
                        {option}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                ) : (
                  question.options.map(option => (
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

      <p>For questions or feedback please contact at adix@adixstudios.com</p>
    </main>
  )
}