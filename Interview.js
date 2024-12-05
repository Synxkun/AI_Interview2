// src/components/Interview.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Interview = () => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [question, setQuestion] = useState('');
    const [llmResponse, setLlmResponse] = useState('');
    const [error, setError] = useState('');

    // Speech Recognition Setup
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true; // Keep listening until stopped
        recognition.interimResults = true; // Show interim results

        recognition.onresult = (event) => {
            const result = event.results[event.resultIndex];
            if (result.isFinal) {
                setTranscript(result[0].transcript);
            }
        };

        recognition.onend = () => {
            if (isListening) {
                recognition.start(); // Restart recognition if still listening
            }
        };

        if (isListening) {
            recognition.start();
        }

        return () => {
            recognition.stop(); // Cleanup on component unmount
        };
    }, [isListening]);

    const startListening = () => {
        setIsListening(true);
    };

    const stopListening = () => {
        setIsListening(false);
    };

    const fetchQuestion = async () => {
        // Fetch a random question from your backend or a predefined list
        const randomQuestion = "What is your favorite programming language?"; // Example question
        setQuestion(randomQuestion);
        speak(randomQuestion); // Function to speak the question
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    const callLlmApi = async (userInput) => {
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access
                messages: [{ role: 'user', content: userInput }],
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`, // Use environment variable for API key
                    'Content-Type': 'application/json',
                },
            });

            const llmMessage = response.data.choices[0].message.content;
            setLlmResponse(llmMessage);
        } catch (error) {
            console.error('Error calling LLM API:', error);
            setError('Failed to get a response from the AI. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await callLlmApi(transcript); // Call the LLM API with the user's response
        setTranscript(''); // Clear the transcript after submission
        fetchQuestion(); // Fetch a new question after submission
    };

    return (
        <div>
            <h1>AI Interviewer</h1>
            <p>{question}</p>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Your response..."
                    rows="4"
                    cols="50"
                />
                <br />
                <button type="button" onClick={isListening ? stopListening : startListening}>
                    {isListening ? 'Stop Listening' : 'Start Listening'}
                </button>
                <button type="submit">Submit</button>
            </form>
            {llmResponse && <div><h2>AI Response:</h2><p>{llmResponse}</p></div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
};

export default Interview;