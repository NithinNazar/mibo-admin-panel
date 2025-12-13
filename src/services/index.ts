// Export all services for easy importing
export { default as api } from "./api";
export { default as authService } from "./authService";
export { default as clinicianService } from "./clinicianService";
export { default as appointmentService } from "./appointmentService";
export { default as centreService } from "./centreService";
export { default as patientService } from "./patientService";
export { default as analyticsService } from "./analyticsService";

// Export types
export type * from "./authService";
export type * from "./clinicianService";
export type * from "./appointmentService";
export type * from "./centreService";
export type * from "./patientService";
export type * from "./analyticsService";
