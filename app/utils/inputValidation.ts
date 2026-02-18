export type ValidationResult = {
  valid: boolean;
  message: string;
};

export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return {
      valid: false,
      message: "Email address required",
    }
  }

  // format x@x with no spaces in the middle
  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(cleaned)) {
    return {
      valid: false,
      message: "Invalid email address",
    };
  }

  return {
    valid: true,
    message: "",
  };
}


export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return {
      valid: false,
      message: "Password required.",
    };
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters",
    };
  }

  if (password.length > 128) {
    return {
      valid: false,
      message: "Password must be less than 128 characters",
    };
  }

  return {
    valid: true,
    message: "",
  };
}

export function validateAddress(address: string): ValidationResult {
  if (!address) {
    return {
      valid: false,
      message: "Mailing address is required.",
    };
  }

  return {
    valid: true,
    message: "",
  };
}

export function validateSignUp(email: string, password: string, address: string): ValidationResult {
  let result = validateEmail(email);
  if (!result.valid) {return result}
  result = validatePassword(password);
  if (!result.valid) {return result}
  return validateAddress(address);
}