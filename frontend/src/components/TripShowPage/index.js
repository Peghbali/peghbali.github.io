import "./TripShowPage.css";
import { useParams } from "react-router-dom";
import { Link, useHistory } from "react-router-dom";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { deleteTrip } from "../../store/trips";
import { updateTrip } from "../../store/trips";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchTrip } from "../../store/trips";
import { fetchUser } from "../../store/user";
import SearchLine from "../SearchLine";
import Footer from "../Footer";

const TripShowPage = () => {
  const formattedDate = (rawDate) => {
    const date = new Date(rawDate);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .substr(0, 10);
  };

  const { tripId } = useParams();
  const trip = useSelector((state) => state.trips[tripId]);
  const sessionUser = useSelector((state) => state.session.user);
  const history = useHistory();
  const dispatch = useDispatch();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const protectionPrices = {
    Premier: 50,
    Standard: 30,
    Minimum: 10,
    None: 0,
  };

  useEffect(() => {
    if (trip) {
      setStartDate(formattedDate(trip.startDate));
      setEndDate(formattedDate(trip.endDate));
      setSelectedAnswer(trip.protectionPlan);
    }
  }, [trip]);

  useEffect(() => {
    dispatch(fetchTrip(tripId));
    dispatch(fetchUser(sessionUser.id));
  }, [dispatch, tripId]);

  //   if (!trip) return "nothing";

  //   if (!sessionUser || sessionUser.id !== trip.driverId) {
  //     history.push("/login");
  //     return;
  //   }

  const isLoading = !trip || !sessionUser;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (trip.driverId !== sessionUser.id) {
    history.push("/");
    return null;
  }

  const tripPrice = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = (end - start) / (1000 * 60 * 60 * 24) + 1;
    const protectionPrice = protectionPrices[selectedAnswer] * days;
    return days * trip.car.dailyRate + protectionPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    // if (!sessionUser) {
    //   history.push("/login");
    //   return;
    // }
    const tripData = {
      tripId: trip.id,
      carId: trip.car.id,
      startDate,
      endDate,
      protectionPlan: selectedAnswer,
      totalPrice: tripPrice(),
    };

    try {
      await dispatch(updateTrip(tripData));
      history.push("/trips");
    } catch (error) {
      let data;
      try {
        data = await error.clone().json();
      } catch {
        data = await error.text();
      }
      if (data?.errors) setErrors(data.errors);
      else if (data) setErrors([data]);
      else setErrors([error.statusText]);
    }
  };

  const handleAnswerClick = (e) => {
    setSelectedAnswer(e.target.value);
  };

  const handleTripDelete = () => {
    dispatch(deleteTrip(trip.id));
    history.push("/trips");
  };

  return (
    <>
      <SearchLine />
      <div id="trip-edit-form-container">
        {errors && errors.map((error) => <li key={error}>{error}</li>)}
        <div id="car-show-price-container">
          <h3>{`$${trip.car.dailyRate} / day`}</h3>
          {startDate && endDate && selectedAnswer ? (
            <p>{`$${tripPrice()}  total`}</p>
          ) : (
            <p>Add trip dates and protection plan to see final price</p>
          )}
        </div>
        <div id="search-car-show-container">
          <div id="where-container-car-show">
            <p>Pickup & return location</p>
            <h3>{trip.car.location}</h3>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="form-field-title">Trip start</p>
          <div id="from-input-container-car-show">
            <input
              type="date"
              className="search-input-car-show search-date"
              value={startDate}
              onChange={(e) => setStartDate(formattedDate(e.target.value))}
            ></input>
          </div>
          {errors &&
            errors.map((error) => {
              console.log(error, "error in trip show page");
              if (error.includes("Start"))
                return (
                  <p className="booking-error-msg" key={error}>
                    {error}
                  </p>
                );
            })}
          <p className="form-field-title">Trip end</p>
          <div id="until-input-container-car-show">
            <input
              type="date"
              className="search-input-car-show search-date"
              value={endDate}
              onChange={(e) => setEndDate(formattedDate(e.target.value))}
            ></input>
          </div>
          {errors &&
            errors.map((error) => {
              if (error.includes("End"))
                return (
                  <p className="booking-error-msg" key={error}>
                    {error}
                  </p>
                );
            })}

          <h2 className="form-field-title">Please select a protection plan</h2>
          <div id="protection-plan-options-container">
            <label
              className={`booking-protection-button ${
                selectedAnswer === "Premier" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="booking-protection"
                value="Premier"
                onChange={handleAnswerClick}
              />
              Premier: Chill out and drive happy with the maximum coverage plan.
              Price: $50 / day
            </label>
            <label
              className={`booking-protection-button ${
                selectedAnswer === "Standard" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="booking-protection"
                value="Standard"
                onChange={handleAnswerClick}
              />
              Standard: Hit the road confidently with solid protection. Price:
              $30 / day
            </label>
            <label
              className={`booking-protection-button ${
                selectedAnswer === "Minimum" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="booking-protection"
                value="Minimum"
                onChange={handleAnswerClick}
              />
              Minimum: Stay covered while pinching some pennies. Price: $10 /
              day
            </label>
            <label
              className={`booking-protection-button ${
                selectedAnswer === "None" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="booking-protection"
                value="None"
                onChange={handleAnswerClick}
              />
              None: Decline Caro's coverage. Price: $0 / day
            </label>
          </div>
          {errors &&
            errors.map((error) => {
              if (error.includes("Protection"))
                return (
                  <p className="booking-error-msg" key={error}>
                    Please select a protection option from the above
                  </p>
                );
            })}
          <div>
            <button id="book-car-button">Update this booking</button>
          </div>
        </form>
        <div>
          <button id="delete-trip-button" onClick={handleTripDelete}>
            Cancel trip
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TripShowPage;