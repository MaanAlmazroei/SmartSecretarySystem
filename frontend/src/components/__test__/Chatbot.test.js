import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Chatbot from "../Chatbot/Chatbot";

describe("Chatbot Component", () => {
  beforeEach(() => {
    // Mocking scrollTo function
    HTMLElement.prototype.scrollTo = jest.fn();
  });

  const setupChatbot = () => {
    render(<Chatbot />);
    const inputField = screen.getByPlaceholderText(/Message.../i);
    const sendButton = screen.getByText(/Send/i);
    return { inputField, sendButton };
  };
  // mock fetch response api 
  const mockFetchResponse = (ok, response) => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok,
        json: () => Promise.resolve(response),
      })
    );
  };

  test("renders the chatbot component", () => {
    render(<Chatbot />);
    expect(screen.getByText(/Chatbot/i)).toBeInTheDocument();
  });

  test("sends a message to the chatbot and receives a response", async () => {
    // Mock successful API response
    mockFetchResponse(true, {
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
    });

    const { inputField, sendButton } = setupChatbot();

    // Simulate user input and send message
    const userInput = "Where can I find tickets page?";
    fireEvent.change(inputField, { target: { value: userInput } });
    fireEvent.click(sendButton);

    console.log("User Message:", userInput);

    // Wait for bot response
    await waitFor(() => {
      const botResponse = screen.getByText("Do not mock me please");
      expect(botResponse).toBeInTheDocument();
      console.log("Bot Message:", botResponse.textContent);
    });
  });

  test("handles API errors", async () => {
    // Mock failed API response
    mockFetchResponse(false, {
      error: { message: "Something went wrong" },
    });

    const { inputField, sendButton } = setupChatbot();

    // Simulate user input and send message
    const userInput = "Where is Oman located?";
    fireEvent.change(inputField, { target: { value: userInput } });
    fireEvent.click(sendButton);

    console.log("User Message:", userInput);

    // Wait for error message
    await waitFor(() => {
      const errorMessage = screen.getByText(
        "Sorry, I encountered an error. Please try again."
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test("toggles chatbot minimize state and shows the chatbot icon", () => {
    render(<Chatbot />);

    // Hide the chatbot
    const hideButton = screen.getByText(/Hide/i);
    expect(hideButton).toBeInTheDocument();
    fireEvent.click(hideButton);

    // Check if the chatbot icon appears
    const chatbotIcon = screen.getByRole("img", { name: /Chatbot Icon/i });
    expect(chatbotIcon).toBeInTheDocument();

    // Click the chatbot icon to expand again
    fireEvent.click(chatbotIcon);

    // Verify chatbot is expanded again
    expect(screen.getByText(/Hey there/i)).toBeInTheDocument();
    expect(screen.getByText(/Hide/i)).toBeInTheDocument();
  });
});