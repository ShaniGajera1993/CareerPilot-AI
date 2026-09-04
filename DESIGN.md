---
version: alpha
name: "CareerPilot AI"
description: "A focused career workspace combining calm professional utility with a confident violet coaching identity."
colors:
  primary: "#6957E8"
  primary-soft: "#F1EFFF"
  ink: "#15182B"
  muted: "#70768A"
  background: "#F6F7FB"
  surface: "#FFFFFF"
  border: "#E9E8F0"
  success: "#2F9F7D"
  danger: "#B5424C"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
  body:
    fontFamily: "DM Sans, sans-serif"
rounded:
  sm: "0.4375rem"
  DEFAULT: "0.5625rem"
  lg: "1.125rem"
spacing:
  control-height: "2.9375rem"
  page-gutter: "1.5rem"
  page-max: "73.75rem"
components:
  auth-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    height: "2.9375rem"
    rounded: "{rounded.DEFAULT}"
  button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    height: "2.9375rem"
    rounded: "{rounded.DEFAULT}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  validation-error:
    backgroundColor: "{colors.background}"
    textColor: "{colors.danger}"
    rounded: "{rounded.sm}"
---

# CareerPilot AI Design System

## Overview

### Creative North Star

CareerPilot should feel like a well-organized career coach's workspace: encouraging and personal at the entry points, then quiet and information-led while the user is working.

### Product context and register

- **Audience and primary job:** Job seekers improving applications, tracking opportunities, and preparing for interviews.
- **Target markets and evidence:** The product README describes a global career-assistance platform; no country-specific workflow is currently defined.
- **Locales and language policy:** English is the current product language. UI copy remains plain, concise, and action-oriented.
- **Usage scene:** Responsive web use across personal laptops and phones, with focused form entry and recurring dashboard visits.
- **Register:** Hybrid. Public and authentication routes carry the violet coaching identity; authenticated workspace routes prioritize familiar product utility.
- **Memorable signature:** Violet AI accents paired with compact coaching language and small sparkle motifs.
- **Restraint:** Forms, validation, loading, and dashboard data remain conventional and calm so users can act without decoding the interface.
- **Anti-references:** Avoid neon AI aesthetics, glass-heavy surfaces, and generic enterprise gray grids; these weaken trust or erase the career-coaching identity.
- **Token ownership/runtime mapping:** This document mirrors the established runtime values in `frontend/src/App.css`, `frontend/src/index.css`, and component stylesheets. Runtime CSS remains canonical; drift is checked during UI changes.

## Colors

`primary` is the expressive and focus color. `ink`, `muted`, `surface`, `background`, and `border` establish the product hierarchy. `danger` is reserved for validation and destructive outcomes; `success` communicates confirmed positive outcomes. The current product supports a light theme, with system colors preserved in forced-color mode.

## Typography

Manrope carries brand names and display headings. DM Sans carries controls, body copy, labels, and dashboard data. Sentence case is preferred for actions and status text; uppercase is limited to compact category labels.

## Layout

Public content uses the 73.75rem maximum width and 1.5rem responsive gutters. Authentication uses a split brand-and-form composition above 800px and a single-column form below it. Async states reserve their footprint so controls do not move during requests.

## Elevation & Depth

Hierarchy comes primarily from white surfaces, pale violet tonal layers, fine borders, and restrained shadows. Strong elevation is reserved for floating previews and primary calls to action, not routine form fields.

## Shapes

Controls use compact 7–9px radii; cards use larger 18px rounding. Circular shapes are reserved for avatars, status marks, and decorative orbs. Lucide icons use their standard outlined stroke language.

## Components

### Foundational visual states

Interactive controls provide hover, visible focus, active, disabled, busy, success, and error states. Remote mutations wait for server confirmation. Loading indicators use fixed geometry and slow down under reduced-motion preferences.

### Buttons and actions

Violet solid buttons are primary actions. Text and icon buttons are secondary. Busy buttons preserve dimensions, disable duplicate activation, and expose their status accessibly.

### Navigation and data display

The public navigation is spacious and brand-led. The dashboard sidebar and cards are denser and use violet only for active state, progress, or AI-assisted actions.

### Forms and overlays

Authentication fields use persistent labels, inline field errors, a form-level error summary, and accessible password reveal controls. Server errors preserve non-secret input; invalid login clears the password. The app owns validation rather than browser-native bubbles.

### Iconography

Lucide is the canonical icon family. Icons support labels and never replace accessible names on icon-only controls.

### Motion

Motion communicates navigation or pending state and stays brief. Reduced-motion mode avoids decorative movement and slows necessary indeterminate progress.

### Content and data visualization

Copy speaks from the user's perspective with direct verbs such as “Sign in,” “Create free account,” and “Log out.” Raw backend errors and secrets never appear in product feedback.

## Do's and Don'ts

- **Do:** Keep career guidance encouraging while making forms and recovery instructions precise.
- **Do:** Reuse shared fields, session state, and API error normalization across authentication screens.
- **Don't:** introduce a second accent palette or screen-local validation pattern.
- **Don't:** trade field clarity, focus visibility, or stable loading geometry for decoration.
