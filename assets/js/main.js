/* DigiTour - Main Frontend Logic & Interactions */

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Hotel Booking Date & Price Calculator
    const checkInInput = document.getElementById('check_in_date');
    const checkOutInput = document.getElementById('check_out_date');
    const pricePerNightElem = document.getElementById('price_per_night');
    const nightsCountElem = document.getElementById('total_nights');
    const totalPriceElem = document.getElementById('total_price_calc');

    function calculateBookingPrice() {
        if (!checkInInput || !checkOutInput || !pricePerNightElem) return;

        const checkInVal = checkInInput.value;
        const checkOutVal = checkOutInput.value;
        const pricePerNight = parseFloat(pricePerNightElem.getAttribute('data-price')) || 0;

        if (checkInVal && checkOutVal) {
            const d1 = new Date(checkInVal);
            const d2 = new Date(checkOutVal);
            const timeDiff = d2.getTime() - d1.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

            if (daysDiff > 0) {
                if (nightsCountElem) nightsCountElem.innerText = daysDiff;
                const total = daysDiff * pricePerNight;
                if (totalPriceElem) totalPriceElem.innerText = '$' + total.toFixed(2);
            } else {
                if (nightsCountElem) nightsCountElem.innerText = '0 (Invalid dates)';
                if (totalPriceElem) totalPriceElem.innerText = '$0.00';
            }
        }
    }

    if (checkInInput && checkOutInput) {
        checkInInput.addEventListener('change', calculateBookingPrice);
        checkOutInput.addEventListener('change', calculateBookingPrice);
    }
});
