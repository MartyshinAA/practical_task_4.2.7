'use strict';

const search = document.querySelector('.search');
const suggestionsList = document.querySelector('.search-suggestions');
const addedSearch = document.querySelector('.added-repository');
let suggestionsListArray = [];

// Отправляем конечный запрос пользователя на сервер

const debounce = (fn, debounceTime) => {
  let debouncedFunction;
  return function () {
    clearTimeout(debouncedFunction);
    debouncedFunction = setTimeout(() => {
      fn.apply(this, arguments);
    }, debounceTime);
  };
};

// Притормаживаем запросы пользователя на сервер, дожидаемся конечного, затем обнуляем список поиска

function typing() {
  getRepository(search.value);
  suggestionsList.innerHTML = '';
}

// Переназначаем функцию набора и отправляем в debounce с временек отклика

// eslint-disable-next-line no-func-assign
typing = debounce(typing, 500);

// Считываем нажатия клавишь и отправляем в переназначенную функцию набора поискового запроса

search.addEventListener('keyup', typing);

// Запрашиваем репозитории, выводим нужное колличество(5), затем добавляем в новый элемент, для сохранения

async function getRepository(input) {
  if (!input) return;
  await fetch(
    `https://api.github.com/search/repositories?q=${input}&per_page=5`
  )
    .then((res) => res.json())
    .then((repo) => {
      for (let repository of repo.items) {
        const div = document.createElement('div');
        div.innerHTML = repository.name;
        suggestionsList.append(div);
        let suggestion = {
          Name: repository.name,
          Owner: repository.owner.login,
          Stars: repository.stargazers_count,
        };
        suggestionsListArray.push(suggestion);
      }
      suggestionsList.addEventListener('click', (e) => {
        let searchedRepository = document.createElement('div');
        for (let repository of suggestionsListArray) {
          if (e.target.innerText === repository.Name) {
            searchedRepository.innerHTML = `Name: ${repository.Name}<br>
                                            Owner: ${repository.Owner}<br>
                                            Stars: ${repository.Stars}
                                            <div class="close-button"></div>`;
            searchedRepository.classList.add('added-element');
            addedSearch.append(searchedRepository);
            suggestionsListArray = [];
          }
        }
      });
    })
    .catch((err) => console.error(err));
}

// Удаляем добавленный элемент кликом по крестику

addedSearch.addEventListener('click', (e) => {
  if (e.target.className == 'close-button') {
    (e.target.closest('.added-element')).remove();
  }
});

// Закрываем список поиска кликом вне области этого списка

document.addEventListener('click', (e) => {
  const clickIntoSearchSuggestions = e.composedPath().includes(addedSearch);
  if (!clickIntoSearchSuggestions) {
    suggestionsList.innerHTML = '';
  }
});
