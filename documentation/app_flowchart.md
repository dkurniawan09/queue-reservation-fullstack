flowchart TD
    Start[User visits site] --> AuthCheck{User authenticated}
    AuthCheck -- No --> Login[Show login register]
    AuthCheck -- Yes --> RoleCheck{User or Admin}
    RoleCheck -- User --> ReservePage[Open reservation page]
    RoleCheck -- Admin --> AdminDashboard[Open admin queue dashboard]

    ReservePage --> ReservationForm[Fill reservation form]
    ReservationForm --> SubmitReservation[Submit reservation]
    SubmitReservation --> ReservationAPI[POST api reservations]
    ReservationAPI --> DB[Save reservation in DB]
    DB --> ReservationConfirmation[Show confirmation]

    RoleCheck -- User --> MyReservations[Open my reservations]
    MyReservations --> GetReservations[GET api reservations]
    GetReservations --> DB
    DB --> DisplayReservations[Display reservations]

    AdminDashboard --> GetQueue[GET api queues id]
    GetQueue --> DB
    DB --> DisplayQueue[Display queue list]
    DisplayQueue --> NextAction[Click next or cancel]
    NextAction -- Next --> AdvanceQueue[POST api queues id advance]
    NextAction -- Cancel --> CancelReservation[POST api reservations id cancel]
    AdvanceQueue --> DB
    CancelReservation --> DB
    DB --> QueueUpdated[Update queue display]
    QueueUpdated --> DisplayQueue