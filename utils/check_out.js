//Address 
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const fullNameInput = document.getElementById("full-name");
    const mobileInput = document.getElementById("mobile-number");
    const pincodeInput = document.getElementById("pincode");
    const addressInput = document.getElementById("address");
    const landmarkInput = document.getElementById("landmark");
    const townCityInput = document.getElementById("town-city");
    const stateSelect = document.getElementById("state");
    const submitButton = document.querySelector('button[type="submit"]');
    const placeOrderBtn = document.getElementById('placeOrder');
    const addressError = document.getElementById('addressError');
    const paymentError = document.getElementById('paymentError');

    const namePattern = /^[a-zA-Z ]{2,}$/;
    const mobilePattern = /^[0-9]{10}$/;
    const pincodePattern = /^[0-9]{6}$/;

    function validateInput(input, pattern, errorId) {
        const value = input.value.trim();
        const isValid = pattern ? pattern.test(value) : value !== "";
        input.classList.toggle("is-invalid", !isValid);
        document.getElementById(errorId).style.display = isValid ? "none" : "block";
        return isValid;
    }

    function validateFullName() { return validateInput(fullNameInput, namePattern, "nameError") }
    function validateMobile() { return validateInput(mobileInput, mobilePattern, "mobileError") }
    function validatePincode() { return validateInput(pincodeInput, pincodePattern, "pincodeError") }
    function validateAddress() { return validateInput(addressInput, null, "flatError") }
    function validateLandmark() { return validateInput(landmarkInput, null, "landmarkError") }
    function validateTownCity() { return validateInput(townCityInput, null, "cityError") }
    function validateState() { return validateInput(stateSelect, null, "stateError") }

    function validateForm() {
        const isValid = validateFullName() && validateMobile() && validatePincode() &&
            validateAddress() && validateLandmark() && validateTownCity() && validateState();
        submitButton.disabled = !isValid;
        return isValid;
    }

    [fullNameInput, mobileInput, pincodeInput, addressInput, landmarkInput, townCityInput, stateSelect]
        .forEach(input => input.addEventListener("input", validateForm));

    async function submitFormData() {
        const data = {
            full_name: fullNameInput.value.trim(),
            mobile_number: mobileInput.value.trim(),
            pincode: pincodeInput.value.trim(),
            address: addressInput.value.trim(),
            landmark: landmarkInput.value.trim(),
            town_city: townCityInput.value.trim(),
            state: stateSelect.value.trim(),
            sourcePage: form.querySelector('[name="sourcePage"]').value
        };
        
        try {
            const response = await fetch("/user_address", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            form.reset();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    text: 'Address saved successfully!',
                    toast: true,
                    position: 'top-right',
                    showConfirmButton: false,
                    timer: 3000
                });
                const modalElement = document.getElementById("shippingModal");
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();
            } else {
                Swal.fire({
                    icon: 'error',
                    text: 'Error adding address!' + result.message,
                    toast: true,
                    position: 'top-right',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        } catch (error) {
            console.error("Error submitting form data:", error);
            Swal.fire({
                    icon: 'error',
                    text: 'Error submitting form data.!',
                    toast: true,
                    position: 'top-right',
                    showConfirmButton: false,
                    timer: 3000
            });

        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (validateForm()) {
            submitFormData();
        }
    });


//PAYMENT_OPTIONS

//Place Order with COD
let total = '<%- grand_total %>';
let coupon_id = '<%- appliedCoupon %>'
console.log('sdgafjlgasdf:', coupon_id);

placeOrderBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    const selectedAddress = document.querySelector('input[name="selectedAddress"]:checked');
    const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
    let isValid = true;

    if (!selectedAddress) {
        addressError.style.display = 'block';
        isValid = false;
    } else {
        addressError.style.display = 'none';
    }

    if (!selectedPayment) {
        paymentError.style.display = 'block';
        isValid = false;
    } else {
        paymentError.style.display = 'none';
    }

    if (isValid) {
        const address = selectedAddress.value;
        const payment = selectedPayment.value;

        try {
            const response = await fetch("/checkout", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address, payment, coupon_id })
            });
            const result = await response.json();
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    text: 'Order placed successfully!',
                    toast: true,
                    position: 'top-right',
                    showConfirmButton: false,
                    timer: 3000
                });
                setTimeout(function(){
                    window.location.href = '/order_confirmation';
                },2000)
            } else {
                Swal.fire({
                    text: 'Something went wrong! ' + result.message,
                    title: '',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error("Error during checkout:", error);
            Swal.fire({
                text: 'Something went wrong! Please try again later.',
                title: '',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    }
});

    validateForm();
});

document.addEventListener("DOMContentLoaded", function() {
        document.querySelectorAll("[id^='delete_btn_']").forEach(button => {
            button.addEventListener("click", async function (e) {
                e.preventDefault();

                const address_id = e.target.getAttribute('address_data');
                console.log('address id:',address_id)
                const result = await Swal.fire({
                icon: 'warning',
                title: 'Are you sure?',
                text: "Do you really want to delete address?",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
                });
                try{
                    if(result.isConfirmed === true){
                            const response = await fetch(`/delete_address/${address_id}`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        const result = await response.json();
                        if(result.success) {
                            Swal.fire({
                                icon: 'success',
                                text: 'Address deleted successfully',
                                toast: true,
                                position: 'top-right',
                                showConfirmButton: false,
                                timerProgressBar: true,
                                timer: 2000
                            });
                            e.target.closest('.card').remove();
                        }else{
                            Swal.fire({
                                text: 'Something wrong!' + result.message,
                                title: '',
                                icon: 'error',
                                confirmButtonText: 'OK',
                            });
                        }
                    }else{
                        Swal.fire({
                            icon: 'success',
                            text: 'Declined delete address',
                            toast: true,
                            position: 'top-right',
                            showConfirmButton: false,
                            timerProgressBar: true,
                            timer: 2000
                        });
                    }
                } catch (error){
                    console.log('Error deleting address', error)
                }
            })
        })
})

//Coupon section..

const coupons = '<%- JSON.stringify(coupons) %>';
const total = '<%= grand_total %>';
const subtotal = '<%= sub_total %>';
const gst = '<%= gst %>';

let couponsArray;
try {
    couponsArray = JSON.parse(coupons);
} catch (error) {
    console.error('Failed to parse coupons:', error);
    couponsArray = [];  
}

document.addEventListener("DOMContentLoaded", function() {

    let isCouponApplied = false;
    let appliedCoupon = null;

    const addCouponButton = document.getElementById("addCoupon");
    const oerderSummaryElement = document.getElementById("orderSummary");

    addCouponButton.addEventListener("click", async function() {

        if(isCouponApplied){
            Swal.fire({
                title: 'Are you sure',
                text: 'Do you want to remove the applied coupon?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, remove it!',
                cancelButtonText: 'No, keep it'
            }).then((result) => {
                if(result.isConfirmed){
                    removeCoupon();
                    Swal.fire({
                        icon: 'success',
                        text: 'Coupon removed',
                        toast: true,
                        position: 'top-right',
                        showConfirmButton: false,
                        timerProgressBar: true,
                        timer: 2000
                    });
                }
            })
            return;
        }

        const couponOptions = couponsArray.map((coupon, index) => {
        return `
            <div style="width: 48%; border: 2px dashed #ffa500; border-radius: 10px; padding: 10px; margin-bottom: 15px; display: flex; flex-direction: column; background: #f9f9f9; position: relative; box-sizing: border-box;">
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                <input type="radio" id="coupon${index}" name="selectedCoupon" value="${index}" style="margin-right: 10px; width: 16px; height: 16px;">
                <label for="coupon${index}" style="font-weight: bold; color: #ff6b00; font-size: 16px; margin: 0;">
                ${coupon.coupon_name}
                </label>
            </div>
            <p style="font-size: 13px; margin: 4px 0; color: #666; text-align: left;">${coupon.coupon_description}</p>
            <div style="text-align: center; margin-bottom: 5px;">
                <span style="font-weight: bold; color: #333; font-size: 13px;">Code: ${coupon.coupon_code}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                <div>
                <span style="color: #008000; font-weight: bold; font-size: 14px;">${coupon.discount_percentage}% OFF</span><br>
                <small style="font-size: 11px;">(Max ₹${coupon.coupon_max_amount})</small>
                </div>
                <div>
                <span style="color: #555; font-size: 13px;">Min Purchase: ₹${coupon.coupon_min_amount}</span><br>
                <span style="color: #555; font-size: 13px;">Expires: ${coupon.coupon_expires}</span>
                </div>
            </div>
            </div>
        `;
        }).join("");

        const result = await Swal.fire({
        title: 'Select a Coupon',
        html: `<div style="display: flex; flex-wrap: wrap; gap: 5px;">${couponOptions}</div>`,
        showCancelButton: true,
        confirmButtonText: 'Apply Coupon',
            preConfirm: () => {
                const selectedCouponIndex = document.querySelector('input[name="selectedCoupon"]:checked');
                    if (!selectedCouponIndex) {
                        Swal.showValidationMessage('Please select a coupon to apply');
                        return false;
                    }
                return couponsArray[selectedCouponIndex.value];
            }
            
        });

        if (result.isConfirmed) {
            const selectedCoupon = result.value;
            
            try {
                const response = await fetch('/apply_coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedCoupon, total })
                });

                const data = await response.json();

            if (data.success) {
                isCouponApplied = true;
                addCouponButton.textContent = "Remove Coupon"
                Swal.fire({
                icon: 'success',
                text: `${selectedCoupon.coupon_name} coupon Applied Successfully!`,
                toast: true,
                position: 'top-right',
                showConfirmButton: false,
                timer: 3000
                });
                renderOrderSummary(selectedCoupon);
            } else {
                Swal.fire({
                icon: 'error',
                text: `Purchase minimum ₹${selectedCoupon.coupon_min_amount} or above for get the ${selectedCoupon.coupon_name} coupon`,
                toast: true,
                position: 'top-right',
                showConfirmButton: false,
                timer: 3000
                });
            }
            } catch (error){
                console.error('Error applying coupon', error);
                Swal.fire({
                    icon: 'error',
                    text: 'Something went wrong while applying the coupon.',
                    toast: true,
                    position: 'top-right',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        }
    });

    function renderOrderSummary(appliedCoupon) {
        let discountAmount = 0;
        if (appliedCoupon && Number(subtotal) + Number(gst) >= appliedCoupon.coupon_min_amount) {
            discountAmount =  Math.min( (Number(subtotal) * appliedCoupon.discount_percentage )/100,appliedCoupon.coupon_max_amount )
        }

        document.getElementById("orderSummary").innerHTML = `
        <tr>
            <td>Subtotal (Excluding Tax)</td>
            <td class="text-right">₹${Number(subtotal).toFixed(2)}</td>
        </tr>
        <tr>
            <td>Taxes <span class="text-muted">(GST 18%)</span></td>
            <td class="text-right">₹${Number(gst).toFixed(2)}</td>
        </tr>
        ${discountAmount > 0
            ? `<tr>
                <td>Coupon Discount (${appliedCoupon.coupon_name})</td>
                <td class="text-right">-₹${discountAmount.toFixed(2)}</td>
            </tr>`
            : ""}
        <tr>
            <td><strong>Total</strong></td>
            <td class="text-right"><strong>₹${Number(total) - Number(discountAmount).toFixed(2)}</strong></td>
        </tr>
        `;
    }

    function removeCoupon() {
        isCouponApplied = false;
        appliedCoupon = null;

        addCouponButton.textContent = "Apply Coupon";

        oerderSummaryElement.innerHTML = `
            <tr>
                <td>Subtotal (Excluding Tax)</td>
                <td class="text-right">₹${Number(subtotal).toFixed(2)}</td>
            </tr>
            <tr>
                <td>Taxes <span class="text-muted">(GST 18%)</span></td>
                <td class="text-right">₹${Number(gst).toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>Total</strong></td>
                <td class="text-right"><strong>₹${Number(total).toFixed(2)}</strong></td>
            </tr>
        `;
    }
})


















