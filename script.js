document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#schedule tbody');
    const lastNameInput = document.querySelector('#lastName');
    const submitBtn = document.querySelector('#submitBtn');

    let selectedCell = null; // Выбранная ячейка (только одна)
    let occupiedCells = new Set();

    const API_URL = 'https://6744e70eb4e2e04abea405e3.mockapi.io/prayPeople'; // Замените на свой URL MockAPI

    // Функция для получения данных с API
    async function fetchData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const data = await response.json();
            populateTable(data);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    // Функция для обновления данных с API
    async function updateData(columnIndex, updatedData) {
        console.log("columnIndex 2", columnIndex)
        console.log("updatedData", updatedData.id)
        try {
          const response = await fetch(`${API_URL}/${updatedData.id}`, {
            method: 'PUT', // или 'PATCH'
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
          });
    
          if (!response.ok) {
            throw new Error(`Ошибка обновления данных: ${response.status}`);
          }
    
          console.log('Данные успешно обновлены:', await response.json());
        } catch (error) {
          console.error('Ошибка при обновлении данных:', error);
        }
      }

    // Функция для заполнения таблицы
    function populateTable(data) {
        data.forEach((entry, id) => {
          console.log('id', id)
            const row = document.createElement('tr');
            const timeCell = document.createElement('td');
            timeCell.textContent = entry.time;
            row.appendChild(timeCell);

            [entry.lastName1, entry.lastName2].forEach((name, colIndex) => {
                const nameCell = document.createElement('td');
                nameCell.id = `${id}`
                if (name) {
                    nameCell.textContent = name;
                    nameCell.classList.add('occupied');
                    occupiedCells.add(nameCell);
                } else {
                    nameCell.addEventListener('click', () => toggleCellSelection(nameCell, entry, colIndex, id));
                }
                row.appendChild(nameCell);
            });

            tableBody.appendChild(row);
        });
    }

    // Функция для выбора/снятия выбора ячейки
    function toggleCellSelection(cell, entry, colIndex, id) {
        console.log("toggleCellSelection ID", id)
        if (cell.classList.contains('occupied') || occupiedCells.has(cell)) return;
    
        if (cell === selectedCell) {
          cell.classList.remove('selected');
          selectedCell = null;
          return;
        }
    
        if (selectedCell) {
          selectedCell.classList.remove('selected');
        }
    
        cell.classList.add('selected');
        selectedCell = cell;
    
        // Связываем ячейку с данными
        selectedCell.entry = entry;
        selectedCell.columnIndex = colIndex === 0 ? 'lastName1' : 'lastName2';
      }

    // Функция для назначения фамилии выбранной ячейке
    submitBtn.addEventListener('click', () => {
        const lastName = lastNameInput.value.trim();
        if (!lastName) {
            alert('Введите фамилию.');
            return;
        }

        if (!selectedCell) {
            alert('Выберите ячейку.');
            return;
        }

        // Обновляем данные ячейки
        const { entry, columnIndex } = selectedCell;
        entry[columnIndex] = lastName;
        console.log("entry", entry)
        console.log("columnIndex", columnIndex)
        // Обновляем данные на сервере
        updateData(columnIndex, entry);

        // Обновляем визуализацию
        selectedCell.textContent = lastName;
        selectedCell.classList.remove('selected');
        selectedCell.classList.add('occupied');
        occupiedCells.add(selectedCell);

        // Сброс выбора
        selectedCell = null;
        lastNameInput.value = '';
    });

    // Загрузка данных при загрузке страницы
    fetchData();
});
