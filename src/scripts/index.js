/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
import { getUserInfo, getCardList, setUserInfo, setUserAvatar, setNewCard, deleteCardRequest, changeLikeCardStatus } from "./components/api.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";


// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalUsersList = cardInfoModalWindow.querySelector(".popup__list");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
let cardToDelete = null;
let cardElementToDelete = null;

const userData = await getUserInfo();

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const buttonLoading = (submitButton, isLoading, defaultText) => {
  if (isLoading) {
    submitButton.textContent = 'Сохранение...';
    submitButton.disabled = true;
  } else {
    submitButton.textContent = defaultText;
    submitButton.disabled = false;
  }
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const defaultText = submitButton.textContent;
  
  buttonLoading(submitButton, true, defaultText);

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value})
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      buttonLoading(submitButton, false, defaultText);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const defaultText = submitButton.textContent;
  
  buttonLoading(submitButton, true, defaultText);

  setUserAvatar(avatarInput.value)
  .then(() => {
    profileAvatar.style.backgroundImage = `url(${avatarInput.value})`;
    closeModalWindow(avatarFormModalWindow);
  })
  .catch((err) => {
      console.log(err);
  })
  .finally(() => {
      buttonLoading(submitButton, false, defaultText);
  });
};

const handleDeleteCardClick = (cardId, cardElement) => {
  openRemoveCardModal(cardId, cardElement);
};

const handleRemoveCardSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const defaultText = submitButton.textContent;
  
  buttonLoading(submitButton, true, defaultText);

  if (cardToDelete && cardElementToDelete) {
    deleteCardRequest(cardToDelete)
      .then(() => {
        deleteCard(cardElementToDelete);
        closeModalWindow(removeCardModalWindow);
        cardToDelete = null;
        cardElementToDelete = null;
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        buttonLoading(submitButton, false, defaultText);
      });
  }
};

const isLiked = (userData, card) => {
  return card.likes.some((userLike) => userData._id === userLike._id);
};

const handleLikeIcon = (userData, card, likeButton) => {
  const liked = isLiked(userData, card);
  changeLikeCardStatus(card._id, liked)
    .then((updatedCard) => {
      card.likes = updatedCard.likes;
      const likeCount = likeButton.nextElementSibling;
      likeCount.textContent = card.likes.length;
      likeCard(likeButton); 
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const defaultText = submitButton.textContent;
  
  buttonLoading(submitButton, true, defaultText);

  setNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value})
  .then((newCardData) => {
    placesWrap.prepend(
      createCardElement(
        newCardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (likeButton) => handleLikeIcon(userData, newCardData, likeButton),
          onDeleteCard: (cardElement) => handleDeleteCardClick(newCardData._id, cardElement),
          onInfoClick: () => handleInfoClick(newCardData._id)
        } 
      )
    );
    closeModalWindow(cardFormModalWindow);
  })
  .catch((err) => {
      console.log(err);
  })
  .finally(() => {
      buttonLoading(submitButton, false, defaultText);
  });
};

const createInfoString = (title, value) => {
  const template = document.querySelector("#popup-info-definition-template").content;
  const element = template.querySelector(".popup__info-item").cloneNode(true);
  element.querySelector(".popup__info-term").textContent = title;
  element.querySelector(".popup__info-description").textContent = value;
  return element;
};

const createUserPreview = (user) => {
  const template = document.querySelector("#popup-info-user-preview-template").content;
  const element = template.querySelector(".popup__list-item").cloneNode(true);
  element.textContent = user.name;
  return element;
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);
      if (!cardData) {
        console.error("Карточка не найдена");
        return;
      }

      cardInfoModalInfoList.innerHTML = "";
      cardInfoModalUsersList.innerHTML = "";

      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name),
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Количество лайков:", cardData.likes.length)
      );

      cardData.likes.forEach(user => {
        cardInfoModalUsersList.append(createUserPreview(user));
      });

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

const openRemoveCardModal = (cardId, cardElement) => {
  cardToDelete = cardId;
  cardElementToDelete = cardElement;
  openModalWindow(removeCardModalWindow);
};

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    cards.forEach((card) => {
      const cardElement = createCardElement(
        {
          name: card.name,
          link: card.link,
        },
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (likeButton) => handleLikeIcon(userData, card, likeButton),
          onDeleteCard: (cardElement) => handleDeleteCardClick(card._id, cardElement),
          onInfoClick: () => handleInfoClick(card._id)
        }
      );
      
      if (userData._id !== card.owner._id) {
        const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
        deleteButton.style.display = 'none';
      }
      
      const likeButton = cardElement.querySelector(".card__like-button");
      if (isLiked(userData, card)) {
        likeButton.classList.add("card__like-button_is-active");
      }
      
      const likeCount = cardElement.querySelector('.card__like-count');
      likeCount.textContent = card.likes.length;

      placesWrap.prepend(cardElement);
    })
  })
  .catch((err) => {
    console.log(err);
  });
