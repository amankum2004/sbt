import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Login from "../../client/src/pages/Login";

// Create mocks for the contexts
const mockUseLogin = vi.fn();
const mockUseLoading = vi.fn();

// Mock the context hooks
vi.mock("../../client/src/components/LoginContext", () => ({
  useLogin: () => mockUseLogin(),
}));

vi.mock("../../client/src/components/Loading", () => ({
  useLoading: () => mockUseLoading(),
}));

describe("Login Component", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockUseLogin.mockReturnValue({
      login: vi.fn(),
      loggedIn: false,
      checkShopExists: vi.fn(),
    });
    
    mockUseLoading.mockReturnValue({
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
    });
  });

  it("calls onLogin with email and password", async () => {
    const mockLogin = vi.fn();

    // Override the login mock for this specific test
    mockUseLogin.mockReturnValue({
      login: mockLogin,
      loggedIn: false,
      checkShopExists: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Now safely interact
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });
    fireEvent.click(loginButton);

    // Use waitFor for async operations
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "123456",
        contactType: "email",
        phone: "",
      });
    });
  });
});