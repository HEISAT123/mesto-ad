const showInputError = (inputElement, inputErrorClass, errorClass) => {
    const errorElement = document.getElementById(`${inputElement.id}-error`);
    const errorMessage = inputElement.dataset.errorMessage;
    errorElement.textContent = errorMessage;
    errorElement.classList.add(errorClass);
    inputElement.classList.add(inputErrorClass);
};

const hideInputError = (inputElement, inputErrorClass, errorClass) => {
    const errorElement = document.getElementById(`${inputElement.id}-error`);
    errorElement.textContent = '';
    errorElement.classList.remove(errorClass);
    inputElement.classList.remove(inputErrorClass);
};

const hasInvalidInput = (inputList) => {
    return inputList.some((inputElement) => {
        return !inputElement.validity.valid;
    }); 
};

const checkInputValidity = (inputElement, inputErrorClass, errorClass) => {
    if (!inputElement.validity.valid) {
        showInputError(inputElement, inputErrorClass, errorClass);
    } else {
        hideInputError(inputElement, inputErrorClass, errorClass);
    }
};

const enableSubmitButton = (formButton, inactiveButtonClass) => {
    formButton.classList.remove(inactiveButtonClass);
    formButton.disabled = false;
};

const disableSubmitButton = (formButton, inactiveButtonClass) => {
    formButton.classList.add(inactiveButtonClass);
    formButton.disabled = true;
};

const toggleButtonState = (inputList, formButton, inactiveButtonClass) => {
    if (hasInvalidInput(inputList)) {
        disableSubmitButton(formButton, inactiveButtonClass);
    } else {
        enableSubmitButton(formButton, inactiveButtonClass);
    }
};

const setEventListeners = (form, inputSelector, submitButtonSelector, 
  inactiveButtonClass, inputErrorClass, errorClass) => {
    const inputList = Array.from(form.querySelectorAll(inputSelector));
    const formButton = form.querySelector(submitButtonSelector);
    toggleButtonState(inputList, formButton, inactiveButtonClass);
    inputList.forEach((inputElement) => {
        inputElement.addEventListener('input', () => {
            checkInputValidity(inputElement, inputErrorClass, errorClass);
            toggleButtonState(inputList, formButton, inactiveButtonClass);
        });
    });
};

export const clearValidation = (form, validationSettings) => {
    const v = validationSettings;
    const inputList = Array.from(form.querySelectorAll(v.inputSelector));
    const formButton = form.querySelector(v.submitButtonSelector);
    inputList.forEach((inputElement) => {
        hideInputError(inputElement, v.inputErrorClass, v.errorClass);
    });
    disableSubmitButton(formButton, v.inactiveButtonClass);
};

export const enableValidation = (validationSettings) => {
    const v = validationSettings;
    const formList = Array.from(document.querySelectorAll(v.formSelector));
    formList.forEach((form) => {
        setEventListeners(form, v.inputSelector, v.submitButtonSelector, v.inactiveButtonClass, v.inputErrorClass, v.errorClass);
    });
};