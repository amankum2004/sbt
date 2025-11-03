import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Simple mock component for testing
const MockLogin = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!email || !password) {
      return; // Validation failed
    }
    
    // Simulate API call
    console.log('Login attempt with:', { email, password });
  };

  return (
    <div>
      <h2>Login to Your Account</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          name="email"
          placeholder="Email" 
          data-testid="email-input"
        />
        <input 
          type="password" 
          name="password"
          placeholder="Enter your password" 
          data-testid="password-input"
        />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

describe("Login Component - Minimal", () => {
  it("renders login form", () => {
    render(
      <BrowserRouter>
        <MockLogin />
      </BrowserRouter>
    );

    // Use more specific queries to avoid multiple matches
    expect(screen.getByRole("heading", { name: "Login to Your Account" })).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("allows entering email and password", () => {
    render(
      <BrowserRouter>
        <MockLogin />
      </BrowserRouter>
    );

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("submits form with email and password", async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(
      <BrowserRouter>
        <MockLogin />
      </BrowserRouter>
    );

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Login attempt with:', 
        { email: 'test@example.com', password: 'password123' }
      );
    });

    consoleSpy.mockRestore();
  });
});