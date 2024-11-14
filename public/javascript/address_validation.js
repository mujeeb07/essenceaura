const fullName = document.getElementById('full_name');
const mobileNumber = document.getElementById('mobile_number');
const pincode = document.getElementById('pincode');
const address = document.getElementById('address');
const landmark = document.getElementById('landmark');
const townCity = document.getElementById('town_city');
const state = document.getElementById('state');


fullName.addEventListener('input', validateName);
mobileNumber.addEventListener('input', validateMobile);
pincode.addEventListener('input', validatePincode);
address.addEventListener('input', validateAddress);
landmark.addEventListener('input', validateLandmark);
townCity.addEventListener('input', validateCity);
state.addEventListener('change', validateState);


function validateName() {
  if (fullName.value.trim() === '') {
    fullName.classList.add('is-invalid');
    return false;
  } else {
    fullName.classList.remove('is-invalid');
    return true;
  }
}

function validateMobile() {
  const regex = /^[0-9]{10}$/;
  if (!regex.test(mobileNumber.value)) {
    mobileNumber.classList.add('is-invalid');
    return false;
  } else {
    mobileNumber.classList.remove('is-invalid');
    return true;
  }
}

function validatePincode() {
  const regex = /^[0-9]{6}$/;
  if (!regex.test(pincode.value)) {
    pincode.classList.add('is-invalid');
    return false;
  } else {
    pincode.classList.remove('is-invalid');
    return true;
  }
}

function validateAddress() {
  if (address.value.trim() === '') {
    address.classList.add('is-invalid');
    return false;
  } else {
    address.classList.remove('is-invalid');
    return true;
  }
}

function validateLandmark() {
  if (landmark.value.trim() === '') {
    landmark.classList.add('is-invalid');
    return false;
  } else {
    landmark.classList.remove('is-invalid');
    return true;
  }
}

function validateCity() {
  if (townCity.value.trim() === '') {
    townCity.classList.add('is-invalid');
    return false;
  } else {
    townCity.classList.remove('is-invalid');
    return true;
  }
}

function validateState() {
  if (state.value === '') {
    state.classList.add('is-invalid');
    return false;
  } else {
    state.classList.remove('is-invalid');
    return true;
  }
}


document.querySelector('.btn-primary').addEventListener('click', function(event) {
  event.preventDefault(); 

  const isValid = validateName() && validateMobile() && validatePincode() && 
                  validateAddress() && validateLandmark() && validateCity() && validateState();


  if (isValid) {
    const addressData = {
      fullName: fullName.value,
      mobileNumber: mobileNumber.value,
      pincode: pincode.value,
      address: address.value,
      landmark: landmark.value,
      townCity: townCity.value,
      state: state.value
    };


    fetch("/user_address", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addressData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        Swal.fire({
            icon: 'success',
            title: 'Address added successfully!',
            showConfirmButton: true,
            confirmButtonText: 'OK'
        })

        document.getElementById('address-form').reset();
        
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
      } else { 
        Swal.fire({
            icon: 'failiure',
            title: 'Error adding address: ' + data.message,
            showConfirmButton: true,
            confirmButtonText: 'OK'
        })
        
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
});
