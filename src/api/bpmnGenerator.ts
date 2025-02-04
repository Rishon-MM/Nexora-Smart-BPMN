export const generateBpmnModel = async (scenario: string): Promise<any> => {
    try {
        const response = await fetch('https://api.example.com/generateBpmn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenario }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate BPMN model');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error generating BPMN model:', error);
        throw error; // Re-throw the error for further handling
    }
};
