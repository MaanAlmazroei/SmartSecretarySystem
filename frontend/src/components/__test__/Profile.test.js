import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "../Profile/Profile";
import { useAuth } from "../../Context/AuthContext";
import { getUser, updateUser } from "../../services/ApiService";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../Context/AuthContext");
jest.mock("../../services/ApiService");

const mockUser = { uid: "user123", email: "test@mail.com" };

beforeEach(() => {
  useAuth.mockReturnValue({ user: mockUser });
  getUser.mockResolvedValue({
    firstName: "Hatim",
    lastName: "Alharbi",
    phone: "0555411384",
  });
  updateUser.mockResolvedValue({});
});

test("shows loading state", () => {
  render(<Profile />, { wrapper: MemoryRouter });
  expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
});

test("shows error state", async () => {
  getUser.mockRejectedValueOnce(new Error("Failed to fetch"));
  render(<Profile />, { wrapper: MemoryRouter });
  expect(await screen.findByText(/Error:/i)).toBeInTheDocument();
});

test("renders profile overview and toggles edit mode", async () => {
  render(<Profile />, { wrapper: MemoryRouter });
  expect(await screen.findByDisplayValue("Hatim")).toBeInTheDocument();
  expect(screen.getByLabelText(/First Name/i)).toBeDisabled();

  fireEvent.click(screen.getByText(/Edit Profile/i));
  expect(screen.getByLabelText(/First Name/i)).not.toBeDisabled();
});

test("updates fields and saves changes", async () => {
  render(<Profile />, { wrapper: MemoryRouter });
  fireEvent.click(await screen.findByText(/Edit Profile/i));
  fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "Mohammed" } });
  fireEvent.click(screen.getByText(/Save Changes/i));
  await waitFor(() => expect(updateUser).toHaveBeenCalledWith("user123", expect.objectContaining({ firstName: "Mohammed" })));
});

test("shows error if update fails", async () => {
  updateUser.mockRejectedValueOnce(new Error("Update failed"));
  render(<Profile />, { wrapper: MemoryRouter });
  fireEvent.click(await screen.findByText(/Edit Profile/i));
  fireEvent.click(screen.getByText(/Save Changes/i));
  expect(await screen.findByText(/Error:/i)).toBeInTheDocument();
});

test("renders settings tab and updates settings", async () => {
  render(
    <MemoryRouter initialEntries={["/profile/settings"]}>
      <Profile />
    </MemoryRouter>
  );
  expect(await screen.findByText(/Account Settings/i)).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText(/Email Notifications/i));
  fireEvent.change(screen.getByLabelText(/Language/i), { target: { value: "English" } });
});