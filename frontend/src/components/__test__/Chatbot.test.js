import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Chatbot from "../Chatbot/Chatbot";

describe("Chatbot Component", () => {
    beforeEach(() => {
        // mocking scrollTo func
        HTMLElement.prototype.scrollTo = jest.fn();
      });

  test("renders the chatbot component", () => {
    render(<Chatbot />);

    // check if chat is visible
    expect(screen.getByText(/Chatbot/i)).toBeInTheDocument();
  });

  
  test("sends a message to the chatbot and receives a response", async () => {
    // mock fetch api for bot reponse
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: "Do not mock me please",
                    },
                  ],
                },
              },
            ],
          }),
      })
    );

    render(<Chatbot />);

    // simulate user input
    const userInput = "Where can i find tickets page?";
    const inputField = screen.getByPlaceholderText(/Message.../i);
    const sendButton = screen.getByText(/Send/i);
    // write user input to input field and click send button
    fireEvent.change(inputField, { target: { value: userInput } });
    fireEvent.click(sendButton);

    console.log("User Message:", userInput);

    // wait for bot response
    await waitFor(() => {
        const botResponse = screen.getByText("Do not mock me please");
      expect(screen.getByText("Do not mock me please")).toBeInTheDocument()
        console.log("Bot Message:", botResponse.textContent);
});

    
  });

});