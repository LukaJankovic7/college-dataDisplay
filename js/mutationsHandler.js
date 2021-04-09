function updateMutationsList(graph, mutation) {
    let mutationsTable = document.querySelector(`#${graph}GraphMutationsList tbody`);

    let dateColumnItem = document.createElement('td');
    let valueColumnItem = document.createElement('td');

    dateColumnItem.innerHTML = mutation[0];
    valueColumnItem.innerHTML = mutation[1];

    let tableRow = document.createElement('tr');
    tableRow.appendChild(dateColumnItem);
    tableRow.appendChild(valueColumnItem);

    mutationsTable.appendChild(tableRow);
}

document.getElementById('soundGraphMutationsButton').addEventListener('click', () => expandMutationsList('sound'))
document.getElementById('lightGraphMutationsButton').addEventListener('click', () => expandMutationsList('light'))

function expandMutationsList(graph) {
    let mutationsList = document.getElementById(`${graph}GraphMutationsList`);
    mutationsList.classList.toggle('mutationsListExpanded');
}