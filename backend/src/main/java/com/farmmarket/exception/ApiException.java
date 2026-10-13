package com.farmmarket.exception;

import org.springframework.http.HttpStatus;

// Throw this from a service when something is wrong, e.g.
// throw new ApiException(HttpStatus.NOT_FOUND, "Product not found.");
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
