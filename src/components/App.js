import React, { useState, useMemo } from "react";
import moment from "moment";
import BigCalendar from "react-big-calendar";
import Popup from "reactjs-popup";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/App.css";

const localizer = BigCalendar.momentLocalizer(moment);

const FILTERS = {
  ALL: "ALL",
  PAST: "PAST",
  UPCOMING: "UPCOMING",
};

const App = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState(FILTERS.ALL);

  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  const isPastEvent = (event) =>
    moment(event.end || event.start).isBefore(moment(), "day");
  const isUpcomingEvent = (event) =>
    moment(event.start).isSameOrAfter(moment(), "day");

  const filteredEvents = useMemo(() => {
    if (filter === FILTERS.PAST) return events.filter(isPastEvent);
    if (filter === FILTERS.UPCOMING) return events.filter(isUpcomingEvent);
    return events;
  }, [filter, events]);

  const eventStyleGetter = (event) => {
    let backgroundColor = "rgb(222, 105, 135)";
    if (isUpcomingEvent(event)) {
      backgroundColor = "rgb(140, 189, 76)";
    }
    return { style: { backgroundColor, color: "white", border: "none" } };
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setTitle("");
    setLocation("");
    setOpenCreate(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setTitle(event.title);
    setLocation(event.location || "");
    setOpenView(true);
  };

  const handleCreateSave = () => {
    if (!selectedDate || !title.trim()) {
      setOpenCreate(false);
      return;
    }
    const newEvent = {
      id: Date.now(),
      title: title.trim(),
      location: location.trim(),
      start: moment(selectedDate).startOf("day").toDate(),
      end: moment(selectedDate).endOf("day").toDate(),
    };
    setEvents((prev) => [...prev, newEvent]);
    setOpenCreate(false);
  };

  const handleDelete = () => {
    if (!selectedEvent) return;
    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    setOpenView(false);
  };

  const handleEditInline = () => {
    if (!selectedEvent) return;
    const newTitle = window.prompt("Edit title", selectedEvent.title);
    if (newTitle === null) return;
    setEvents((prev) =>
      prev.map((e) =>
        e.id === selectedEvent.id ? { ...e, title: newTitle } : e
      )
    );
  };

  return (
    <div className="app">
      <h2 style={{ textAlign: "center" }}>March 2023</h2>

      <div className="filter-bar">
        <button className="btn" onClick={() => setFilter(FILTERS.ALL)}>
          All
        </button>
        <button className="btn" onClick={() => setFilter(FILTERS.PAST)}>
          Past
        </button>
        <button className="btn" onClick={() => setFilter(FILTERS.UPCOMING)}>
          Upcoming
        </button>
      </div>

      <BigCalendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        views={["month"]}
        defaultView="month"
        defaultDate={new Date(2023, 2, 1)}
        eventPropGetter={eventStyleGetter}
        style={{ height: "80vh", margin: "20px" }}
      />

      {/* Create popup */}
      <Popup open={openCreate} modal closeOnDocumentClick={false}>
        {(close) => (
          <div className="mm-popup__box">
            <div className="mm-popup__box__header">
              <span>Create Event</span>
              <button
                className="mm-popup__close"
                onClick={() => {
                  setOpenCreate(false);
                  close();
                }}
              >
                ×
              </button>
            </div>
            <div className="mm-popup__box__body">
              <input
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                placeholder="Event Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="mm-popup__box__footer">
              <button
                className="mm-popup__btn"
                onClick={() => {
                  setOpenCreate(false);
                  close();
                }}
              >
                Cancel
              </button>
              <button
                className="mm-popup__box__footer__right-space mm-popup__btn mm-popup__btn--success"
                onClick={() => {
                  handleCreateSave();
                  close();
                }}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Popup>

      {/* View/Edit/Delete popup */}
      <Popup open={openView} modal closeOnDocumentClick={false}>
        {(close) => (
          <div className="mm-popup__box">
            <div className="mm-popup__box__header">
              <span>{selectedEvent?.title}</span>
              <button
                className="mm-popup__close"
                onClick={() => {
                  setOpenView(false);
                  close();
                }}
              >
                ×
              </button>
            </div>
            <div className="mm-popup__box__body">
              <p>
                Date:{" "}
                {selectedEvent &&
                  moment(selectedEvent.start).format("MMMM DD, YYYY")}
              </p>
              <p>Location: {selectedEvent?.location || "location"}</p>
            </div>
            <div className="mm-popup__box__footer">
              <button
                className="mm-popup__btn mm-popup__btn--info"
                onClick={handleEditInline}
              >
                Edit
              </button>
              <button
                className="mm-popup__btn mm-popup__btn--danger"
                onClick={() => {
                  handleDelete();
                  close();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
};

export default App;
