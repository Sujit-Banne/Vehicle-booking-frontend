import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Form() {
    const [formStage, setFormStage] = useState(1);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [wheels, setWheels] = useState('');
    const [selectedVehicleType, setSelectedVehicleType] = useState('');
    const [selectedVehicleModel, setSelectedVehicleModel] = useState('');
    const [vehicles, setVehicles] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false)

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axios.get('https://vehicle-booking-backend.onrender.com/api/vehicles');
                setVehicles(response.data);
                console.log(response.data);

            } catch (error) {
                console.log(error);
            }
        };
        fetchVehicles();
    }, []);

    const handleNextStep = () => {
        let validationError = '';

        if (formStage === 1 && (!firstName || !lastName)) {
            validationError = 'Please enter your first and last name.';
        } else if (formStage === 2 && !wheels) {
            validationError = 'Please select the number of wheels.';
        } else if (formStage === 3 && !selectedVehicleType) {
            validationError = 'Please select the type of vehicle.';
        } else if (formStage === 4 && !selectedVehicleModel) {
            validationError = 'Please select a specific vehicle model.';
        } else if (formStage === 5 && (!startDate || !endDate)) {
            validationError = 'Please enter both the start and end dates.';
        }

        if (validationError) {
            alert(validationError);
            return;
        }

        setFormStage(formStage + 1);
        console.log('next');
    };

    const handlePrevStep = () => {
        setFormStage(formStage - 1);
    };

    const handleFormSubmit = () => {

        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        if (!parsedStartDate || !parsedEndDate || isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
            alert('Please enter valid start and end dates.');
            return;
        }

        const formData = {
            firstName,
            lastName,
            type: selectedVehicleType,
            model: selectedVehicleModel,
            wheels,
            startDate: parsedStartDate.toISOString(),
            endDate: parsedEndDate.toISOString(),
        };


        // Make API call to book the vehicle
        axios
            .post('https://vehicle-booking-backend.onrender.com/api/book', formData)
            .then((response) => {
                console.log('Booking Successfully:', response.data);
                // Reset the form fields
                setFirstName('');
                setLastName('');
                setWheels('');
                setSelectedVehicleType('');
                setSelectedVehicleModel('');
                setStartDate(null);
                setEndDate(null);
                setFormSubmitted(true);

                setFormStage(formStage + 1);
            })
            .catch((error) => {
                console.error('Error submitting form:', error);
                if (error.response) {
                    // Error response from the server
                    console.log('Server error response:', error.response.data);
                    alert(error.response.data.message);
                } else {
                    // Error occurred during the request
                    console.log('Request error:', error.message);
                    alert('Error occurred during form submission. Please try again.');
                }
            });
    };

    const resetForm = () => {
        setFormSubmitted(false);
        setFormStage(1);
    };

    const getCurrentDate = () => {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getMaxEndDate = () => {
        if (startDate) {
            const maxEndDate = new Date(startDate);
            maxEndDate.setDate(maxEndDate.getDate() + 30);
            return maxEndDate.toISOString().substr(0, 10);
        }
        return '';
    };


    return (
        <div className='container'>
            {formSubmitted ? (
                <div>
                    <h2>Booking Successfully</h2>
                    <button onClick={resetForm}>Start Over</button>
                </div>
            ) : (
                <>
                    {formStage === 1 && (
                        <div>
                            <h2>What is your name?</h2>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                            <button onClick={handleNextStep}>Next</button>
                        </div>
                    )}

                    {formStage === 2 && (
                        <div>
                            <h2>Number of wheels</h2>
                            <label>
                                <input
                                    type="radio"
                                    name="numWheels"
                                    value="2"
                                    checked={wheels === "2"}
                                    onChange={(e) => setWheels(e.target.value)}
                                />
                                2
                            </label>
                            <br />
                            <label>
                                <input
                                    type="radio"
                                    name="numWheels"
                                    value="4"
                                    checked={wheels === "4"}
                                    onChange={(e) => setWheels(e.target.value)}
                                />
                                4
                            </label>
                            <br />
                            <button onClick={handlePrevStep}>Back</button>
                            <button onClick={handleNextStep}>Next</button>
                        </div>
                    )}

                    {formStage === 3 && (
                        <div>
                            <h2>Type of vehicle</h2>
                            {vehicles
                                .filter((vehicle) => vehicle.wheels.toString() === wheels)
                                .map((vehicle) => (
                                    <label key={vehicle.type}>
                                        <input
                                            type="radio"
                                            name="vehicleType"
                                            value={vehicle.type}
                                            checked={selectedVehicleType === vehicle.type}
                                            onChange={(e) => {
                                                setSelectedVehicleType(e.target.value);
                                                setSelectedVehicleModel("");
                                            }}
                                        />
                                        {vehicle.type} - Booked Dates: {vehicle.startDate ? new Date(vehicle.startDate).toDateString() : 'N/A'} to {vehicle.endDate ? new Date(vehicle.endDate).toDateString() : 'N/A'}
                                    </label>
                                ))}
                            <br />
                            <button onClick={handlePrevStep}>Back</button>
                            <button onClick={handleNextStep}>Next</button>
                        </div>
                    )}

                    {formStage === 4 && (
                        <div>
                            <h2>Specific Model</h2>
                            {vehicles
                                .filter(
                                    (vehicle) =>
                                        vehicle.wheels.toString() === wheels &&
                                        vehicle.type === selectedVehicleType
                                )
                                .map((vehicle) => (
                                    <label key={vehicle.model}>
                                        <input
                                            type="radio"
                                            name="vehicleModel"
                                            value={vehicle.model}
                                            checked={selectedVehicleModel === vehicle.model}
                                            onChange={(e) => setSelectedVehicleModel(e.target.value)}
                                        />
                                        {vehicle.model}
                                    </label>
                                ))}
                            <br />
                            <button onClick={handlePrevStep}>Back</button>
                            <button onClick={handleNextStep}>Next</button>
                        </div>
                    )}


                    {formStage === 5 && (
                        <div>
                            <h2>Date Range</h2>
                            <label>Start Date:</label>
                            <input
                                type="date"
                                value={startDate || ''}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={getCurrentDate()}
                                max={getMaxEndDate()}
                            />
                            <br />
                            <label>End Date:</label>
                            <input
                                type="date"
                                value={endDate || ''}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate || ''}
                                max={getMaxEndDate()}
                            />
                            <br />
                            <button onClick={handlePrevStep}>Back</button>
                            <button disabled={!startDate || !endDate} onClick={handleNextStep}>
                                Next
                            </button>
                        </div>
                    )}


                    {formStage === 6 && (
                        <div>
                            <h2>Review and Submit</h2>
                            <h3>Name: {firstName} {lastName}</h3>
                            <h3>Number of Wheels: {wheels}</h3>
                            <h3>Vehicle Type: {selectedVehicleType}</h3>
                            <h3>Vehicle Model: {selectedVehicleModel}</h3>
                            <h3>Date Range: {startDate} - {endDate}</h3>
                            <button onClick={handlePrevStep}>Back</button>
                            <button onClick={handleFormSubmit}>Submit</button>
                        </div>
                    )}

                </>
            )}


        </div>
    )
}
