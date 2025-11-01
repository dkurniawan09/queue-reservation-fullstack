# App Flow Document for Queue-Reservation-Fullstack

## Onboarding and Sign-In/Sign-Up

When a new visitor arrives at the application URL or landing page, they are greeted with a clear introduction to the queue reservation system and two prominent options: Sign Up and Sign In. Choosing Sign Up directs the user to a registration form where they enter their email address and select a password. After submitting these details, the system creates a new account and immediately signs the user in. If an existing user selects Sign In, they are taken to a login form requesting email and password. In case the user forgets their password, a link labeled Forgot Password appears below the login fields. Clicking that link opens a password recovery form where the user enters their email address. The system then sends a password reset link to that email. Following the link allows the user to choose a new password. Signing out is available from any protected page via a button in the top navigation bar. Selecting Sign Out ends the session and returns the user to the initial landing page.

## Main Dashboard or Home Page

Immediately after a successful sign-in, users land on the Reserve page, which serves as the default view. The top of the screen displays a header with the application name on the left, a theme toggle in the center for switching between light and dark modes, and the user avatar on the right. Clicking the avatar reveals a dropdown with links to Profile Settings and Sign Out. On the left side of the screen, a vertical navigation panel lists links for Reserve, My Reservations, and, if the user has an administrator role, Admin Queue. The main content area shows a calendar component alongside a list of available time slots for the selected date. From here, users can navigate to other parts of the app by clicking the navigation links.

## Detailed Feature Flows and Page Transitions

### Reservation Creation Flow

On the Reserve page, users pick a date on the calendar. Once a date is selected, the available time slots for that date appear below. The user then clicks on a desired time slot, which opens a reservation form overlay. In this form, the user confirms their name and contact details and then clicks a button labeled Book Now. While the reservation is processed, a loading spinner appears. If the booking succeeds, the overlay closes and a confirmation message appears at the top of the page. The user is then encouraged to view their booking by clicking a link that navigates to My Reservations.

### Viewing and Managing Personal Reservations

On the My Reservations page, users see a table or list of all their upcoming and past reservations. Each entry shows the service name, date, time, and status. For upcoming reservations, a Cancel button appears next to each entry. Clicking Cancel prompts the user to confirm their choice in a modal window. After confirmation, an API call runs to delete or update the reservation. Once complete, the list refreshes automatically to reflect the change.

### Admin Queue Management Flow

Administrators access the Admin Queue page by clicking its link in the sidebar. This page displays a live queue table showing pending reservations in chronological order. Each row has controls for marking a reservation as Served or for Canceling it. When the admin clicks Served, the table updates to move the next reservation into the current position. If the admin cancels, a confirmation modal appears, and upon acceptance, the table refreshes without that entry. The page periodically polls the server to ensure that any changes from other admins or new user bookings appear in real time.

### Route Protection and Role Checks

Attempting to access My Reservations or Admin Queue without being signed in immediately redirects the visitor to the Sign In page. If a non-administrator tries to open the Admin Queue link directly via URL, the system shows an unauthorized access page explaining that administrator rights are required and offers a link back to the Reserve page.

## Settings and Account Management

From the user avatar menu in the header, selecting Profile Settings opens the Settings page. Here, users see fields for updating their display name and email address. Below these fields, there is a section for changing the password where the user must enter their current password and then a new one. After making updates, the user clicks Save Changes. A success notification appears to confirm that the information has been updated. Users can navigate back to the Reserve page or any other part of the app via the sidebar or header menu.

## Error States and Alternate Paths

If a user enters an invalid email or password during sign-in, an inline error message appears beneath the corresponding field, prompting correction. During reservation creation, if the chosen time slot becomes unavailable between selection and submission, a validation message in the overlay informs the user that the slot is no longer available and suggests choosing another. For lost connectivity during any API call, a global banner appears at the top of the screen warning of network issues and offering a Retry button. Attempting restricted actions without proper authentication or authorization triggers either a redirect to the Sign In page or display of an unauthorized access page with guidance on how to gain the necessary permissions. Navigating to an undefined URL shows a friendly 404 page with a link back to the Reserve page.

## Conclusion and Overall App Journey

A typical user journey begins with signing up for the queue reservation system and logging in with email and password. They then land on the Reserve page, select a date and time slot, and complete a booking. Users can view and cancel their bookings in My Reservations and adjust personal details in Settings. Administrators follow a parallel path but move on to the Admin Queue page to oversee the live queue, serving or canceling entries as needed. Throughout the experience, clear navigation, inline feedback, and robust error handling guide users step by step from sign-up to everyday usage of the queue management system.