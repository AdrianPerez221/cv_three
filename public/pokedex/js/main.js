// Variables globales
let currentPokemonId = 1;
let statsChart = null;
let filteredPokemon = [];
let isFiltering = false;
let currentFilterType = '';
let inputBuffer = '';
const MAX_POKEMON = 1025;

// Elementos DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicialización
    loadPokemon(currentPokemonId);
    setupEventListeners();
});

function setupEventListeners() {
    // Botones de control - Con verificación de existencia
    const toggleStatsButton = document.getElementById('toggle-stats');
    
    if (toggleStatsButton) {
        toggleStatsButton.addEventListener('click', toggleStatsDisplay);
    } 
    
    // Navegación
    document.getElementById('prev-pokemon').addEventListener('click', () => navigatePokemon(-1));
    document.getElementById('next-pokemon').addEventListener('click', () => navigatePokemon(1));
    document.getElementById('prev-ten').addEventListener('click', () => navigatePokemon(-10));
    document.getElementById('next-ten').addEventListener('click', () => navigatePokemon(10));
    
    // Number Pad
    document.querySelectorAll('.num-button').forEach(button => {
        button.addEventListener('click', handleNumberPad);
    });
    
    // Filtros
    document.querySelectorAll('.type-button').forEach(button => {
        button.addEventListener('click', () => {
            // Toggle selected class
            if (button.classList.contains('selected')) {
                button.classList.remove('selected');
                currentFilterType = '';
            } else {
                document.querySelectorAll('.type-button').forEach(b => b.classList.remove('selected'));
                button.classList.add('selected');
                currentFilterType = button.dataset.type;
            }
        });
    });
    
    document.getElementById('apply-filter').addEventListener('click', applyFilter);
    document.getElementById('clear-filter').addEventListener('click', clearFilter);
    
    // Tabs
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ===============================
// Funciones de navegación y carga
// ===============================
async function loadPokemon(id) {
    try {
        // Reset input buffer
        inputBuffer = '';
        updateNumberDisplay('');
        
        // Asegúrate de que id sea un número válido
        id = parseInt(id);
        if (isNaN(id) || id < 1) {
            id = 1;
        }
        if (id > MAX_POKEMON) {
            id = MAX_POKEMON;
        }

        // Fetch Pokémon data directamente de la PokeAPI
        const apiPokemon = await fetchPokemonData(id);

        if (!apiPokemon) {
            showError('Pokémon no encontrado');
            return;
        }

        // Guardamos el ID actual
        currentPokemonId = apiPokemon.id;

        // Actualizar pantalla principal con datos de la API
        updateMainDisplay(apiPokemon);

        // Cargar datos adicionales (stats, descripción, evolución, movimientos)
        await fetchAndUpdateAdditionalData(apiPokemon);

    } catch (error) {
        console.error('Error loading Pokémon:', error);
        showError('Error al cargar el Pokémon');
    }
}

// Llamada genérica a la PokeAPI
async function fetchPokemonData(idOrName) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName.toString().toLowerCase()}`);
        if (!response.ok) {
            throw new Error('Pokémon no encontrado');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
        return null;
    }
}

// ===============================
// Actualización de la pantalla principal (datos básicos)
// ===============================
function updateMainDisplay(apiPokemon) {
    // Nombre e ID
    document.getElementById('pokemon-name').textContent = apiPokemon.name.toUpperCase();
    document.getElementById('pokemon-id').textContent = `#${apiPokemon.id.toString().padStart(3, '0')}`;

    // Imagen (intentamos official-artwork y luego fallback)
    const pokemonImage = document.getElementById('pokemon-image');
    const officialArtwork = apiPokemon.sprites.other?.['official-artwork']?.front_default;
    const frontDefault = apiPokemon.sprites.front_default;

    pokemonImage.src = officialArtwork || frontDefault || 'placeholder.png';
    pokemonImage.alt = apiPokemon.name;

    // Tipos
    const typesContainer = document.getElementById('pokemon-types');
    typesContainer.innerHTML = '';

    apiPokemon.types.forEach(t => {
        const typeName = t.type.name; // en inglés
        const typeElement = document.createElement('span');
        typeElement.classList.add('type-tag', typeName.toLowerCase());
        typeElement.textContent = translateType(typeName).toUpperCase();
        typesContainer.appendChild(typeElement);
    });

    // Medidas (height en decímetros, weight en hectogramos)
    const alturaM = (apiPokemon.height / 10).toFixed(1); // m
    const pesoKg = (apiPokemon.weight / 10).toFixed(1);  // kg

    document.getElementById('pokemon-measures').textContent =
        `ALT: ${alturaM}m / PESO: ${pesoKg}kg`;
}

// ===============================
// Datos adicionales (stats, descripción, evolución, movimientos)
// ===============================
async function fetchAndUpdateAdditionalData(apiPokemon) {
    // Mini info para stats
    document.getElementById('stats-pokemon-id').textContent = `#${apiPokemon.id.toString().padStart(3, '0')}`;
    document.getElementById('stats-pokemon-name').textContent = apiPokemon.name.toUpperCase();
    document.getElementById('stats-mini-sprite').src =
        apiPokemon.sprites.front_default || apiPokemon.sprites.other?.['official-artwork']?.front_default || 'placeholder.png';

    // Stats (gráfico)
    updateStatsChart(apiPokemon.stats);

    // Species (descripción, categoría, cadena evolutiva)
    try {
        const speciesResponse = await fetch(apiPokemon.species.url);
        if (!speciesResponse.ok) throw new Error('No se pudo cargar los datos de la especie');
        const speciesData = await speciesResponse.json();

        // Descripción, categoría, habilidades
        updateDescription(speciesData, apiPokemon);

        // Cadena evolutiva
        await fetchAndUpdateEvolutionChain(speciesData);
    } catch (error) {
        console.error('Error fetching species data:', error);
    }

    // Movimientos
    updateMoves(apiPokemon.moves);
}

// ===============================
// Stats
// ===============================
function updateStatsChart(stats) {
    const ctx = document.getElementById('stats-chart').getContext('2d');
    
    // Destroy previous chart if exists
    if (statsChart) {
        statsChart.destroy();
    }
    
    const labels = stats.map(stat => translateStatName(stat.stat.name));
    const values = stats.map(stat => stat.base_stat);
    
    // Create new chart
    statsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 255,
                    ticks: {
                        color: '#8bac0f'
                    },
                    grid: {
                        color: 'rgba(139, 172, 15, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8bac0f'
                    },
                    grid: {
                        color: 'rgba(139, 172, 15, 0.2)'
                    }
                }
            }
        }
    });
}

// ===============================
// Descripción, categoría, habilidades
// ===============================
function updateDescription(speciesData, apiPokemon) {
    const descriptionElement = document.querySelector('.pokemon-description');
    const categoryElement = document.getElementById('pokemon-category');
    const abilityElement = document.getElementById('pokemon-ability');
    
    // Texto flavor (preferimos español)
    let flavorText = '';
    const spanishEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es');
    const englishEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
    
    if (spanishEntry) {
        flavorText = spanishEntry.flavor_text;
    } else if (englishEntry) {
        flavorText = englishEntry.flavor_text;
    } else if (speciesData.flavor_text_entries.length > 0) {
        flavorText = speciesData.flavor_text_entries[0].flavor_text;
    }
    
    // Limpiar saltos de línea y espacios
    flavorText = flavorText.replace(/\f/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ');
    descriptionElement.textContent = flavorText;
    
    // Categoría (genus)
    const spanishGenus = speciesData.genera.find(genus => genus.language.name === 'es');
    const englishGenus = speciesData.genera.find(genus => genus.language.name === 'en');
    
    if (spanishGenus) {
        categoryElement.textContent = spanishGenus.genus;
    } else if (englishGenus) {
        categoryElement.textContent = englishGenus.genus;
    } else {
        categoryElement.textContent = 'Desconocido';
    }
    
    // Habilidades desde el propio apiPokemon (sin hacer otra petición)
    if (apiPokemon.abilities && apiPokemon.abilities.length > 0) {
        abilityElement.textContent = apiPokemon.abilities
            .map(ability =>
                capitalizeFirstLetter(ability.ability.name.replace('-', ' '))
            )
            .join(', ');
    } else {
        abilityElement.textContent = 'Desconocido';
    }
}

// ===============================
// Cadena evolutiva
// ===============================
async function fetchAndUpdateEvolutionChain(speciesData) {
    try {
        const evolutionChainUrl = speciesData.evolution_chain.url;
        const response = await fetch(evolutionChainUrl);
        if (!response.ok) throw new Error('No se pudo cargar la cadena evolutiva');
        
        const evolutionData = await response.json();
        const evolutionChain = [];
        
        // Extract evolution chain
        let currentStage = evolutionData.chain;
        while (currentStage) {
            const speciesName = currentStage.species.name;
            const speciesUrl = currentStage.species.url;
            const speciesId = getIdFromUrl(speciesUrl);
            
            evolutionChain.push({
                name: speciesName,
                id: speciesId,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
                evolutionDetails: currentStage.evolution_details.length > 0 ? currentStage.evolution_details[0] : null
            });
            
            if (currentStage.evolves_to.length > 0) {
                currentStage = currentStage.evolves_to[0];
            } else {
                currentStage = null;
            }
        }
        
        updateEvolutionChainUI(evolutionChain);
    } catch (error) {
        console.error('Error fetching evolution chain:', error);
        document.querySelector('.evolution-chain').innerHTML = 'No se pudo cargar la cadena evolutiva.';
    }
}

function updateEvolutionChainUI(evolutionChain) {
    const container = document.querySelector('.evolution-chain');
    container.innerHTML = '';
    
    for (let i = 0; i < evolutionChain.length; i++) {
        const pokemon = evolutionChain[i];
        
        const evolutionItem = document.createElement('div');
        evolutionItem.classList.add('evolution-item');
        
        const sprite = document.createElement('img');
        sprite.src = pokemon.sprite;
        sprite.alt = pokemon.name;
        sprite.classList.add('evolution-sprite');
        sprite.addEventListener('click', () => loadPokemon(pokemon.id));
        evolutionItem.appendChild(sprite);
        
        const name = document.createElement('div');
        name.classList.add('evolution-name');
        name.textContent = capitalizeFirstLetter(pokemon.name);
        evolutionItem.appendChild(name);
        
        container.appendChild(evolutionItem);
        
        if (i < evolutionChain.length - 1) {
            const arrow = document.createElement('div');
            arrow.classList.add('evolution-arrow');
            arrow.innerHTML = '→';
            container.appendChild(arrow);
        }
    }
}

// ===============================
// Movimientos
// ===============================
function updateMoves(moves) {
    const levelMovesContainer = document.querySelector('.level-moves');
    const tmMovesContainer = document.querySelector('.tm-moves');
    
    // Clear containers
    levelMovesContainer.innerHTML = '';
    tmMovesContainer.innerHTML = '';
    
    // Ordenar por nivel (usamos el primer detalle disponible)
    const sortedMoves = [...moves].sort((a, b) => {
        const levelA = a.version_group_details[0]?.level_learned_at || 0;
        const levelB = b.version_group_details[0]?.level_learned_at || 0;
        return levelA - levelB;
    });
    
    // Movimientos por nivel
    const levelMoves = sortedMoves.filter(move => {
        const details = move.version_group_details[0];
        return details && details.move_learn_method.name === 'level-up';
    });
    
    levelMoves.forEach(move => {
        const moveItem = document.createElement('div');
        moveItem.classList.add('move-item');
        
        const level = document.createElement('span');
        level.classList.add('move-level');
        level.textContent = `Nv.${move.version_group_details[0].level_learned_at}`;
        
        const name = document.createElement('span');
        name.textContent = capitalizeFirstLetter(move.move.name.replace('-', ' '));
        
        moveItem.appendChild(level);
        moveItem.appendChild(name);
        levelMovesContainer.appendChild(moveItem);
    });
    
    // Movimientos por máquina (TM/MT)
    const tmMoves = sortedMoves.filter(move => {
        const details = move.version_group_details.find(detail => 
            detail.move_learn_method.name === 'machine'
        );
        return details !== undefined;
    });
    
    tmMoves.forEach(move => {
        const moveItem = document.createElement('div');
        moveItem.classList.add('move-item');
        
        const name = document.createElement('span');
        name.textContent = capitalizeFirstLetter(move.move.name.replace('-', ' '));
        
        moveItem.appendChild(name);
        tmMovesContainer.appendChild(moveItem);
    });
    
    if (levelMoves.length === 0) {
        levelMovesContainer.innerHTML = '<div class="move-item">No hay movimientos por nivel</div>';
    }
    
    if (tmMoves.length === 0) {
        tmMovesContainer.innerHTML = '<div class="move-item">No hay movimientos TM/MT</div>';
    }
}

// ===============================
// Navegación
// ===============================
function navigatePokemon(change) {
    currentPokemonId = parseInt(currentPokemonId);
    change = parseInt(change);
    
    let newId = currentPokemonId + change;
    
    if (newId < 1) newId = MAX_POKEMON;
    if (newId > MAX_POKEMON) newId = 1;
    
    if (isFiltering && filteredPokemon.length > 0) {
        const currentIndex = filteredPokemon.findIndex(id => id === currentPokemonId);
        let newIndex = currentIndex + (change > 0 ? 1 : -1);
        
        if (newIndex < 0) newIndex = filteredPokemon.length - 1;
        if (newIndex >= filteredPokemon.length) newIndex = 0;
        
        newId = filteredPokemon[newIndex];
    }
    
    loadPokemon(newId);
}

// ===============================
// Number Pad
// ===============================
function handleNumberPad(e) {
    const value = e.target.dataset.num;
    
    if (value === 'c') {
        inputBuffer = '';
    } else if (value === 'enter') {
        if (inputBuffer) {
            loadPokemon(parseInt(inputBuffer));
        }
    } else {
        if (inputBuffer.length < 4) {
            inputBuffer += value;
        }
    }
    
    updateNumberDisplay(inputBuffer);
}

function updateNumberDisplay(value) {
    document.getElementById('number-display').textContent = value.padStart(3, ' ');
}

// ===============================
// Cambio entre pantallas
// ===============================
function toggleStatsDisplay() {
    const mainDisplay = document.getElementById('main-display');
    const statsDisplay = document.getElementById('stats-display');
    
    if (mainDisplay.style.display !== 'none') {
        mainDisplay.style.display = 'none';
        statsDisplay.style.display = 'block';
        statsDisplay.classList.add('fadeIn');
    } else {
        statsDisplay.style.display = 'none';
        mainDisplay.style.display = 'block';
        mainDisplay.classList.add('fadeIn');
    }
}

// ===============================
// Filtro por tipo (PokeAPI type endpoint)
// ===============================
async function applyFilter() {
    if (!currentFilterType) {
        clearFilter();
        return;
    }
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${currentFilterType}`);
        if (!response.ok) throw new Error('Error al cargar tipos');
        
        const data = await response.json();
        filteredPokemon = data.pokemon
            .map(p => getIdFromUrl(p.pokemon.url))
            .filter(id => id <= MAX_POKEMON)
            .sort((a, b) => a - b);
        
        if (filteredPokemon.length > 0) {
            isFiltering = true;
            loadPokemon(filteredPokemon[0]);
        } else {
            showError('No hay Pokémon de este tipo');
            clearFilter();
        }
    } catch (error) {
        console.error('Error al aplicar filtro:', error);
        showError('Error al aplicar filtro');
    }
}

function clearFilter() {
    isFiltering = false;
    filteredPokemon = [];
    
    document.querySelectorAll('.type-button').forEach(b => b.classList.remove('selected'));
    currentFilterType = '';
    
    loadPokemon(currentPokemonId);
}

// ===============================
// Funciones auxiliares
// ===============================
function getIdFromUrl(url) {
    const parts = url.split('/');
    return parseInt(parts[parts.length - 2]);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showError(message) {
    alert(message);
}

// Traducción de tipos
function translateType(type) {
    const typeTranslations = {
        'normal': 'Normal',
        'fire': 'Fuego',
        'water': 'Agua',
        'electric': 'Eléctrico',
        'grass': 'Planta',
        'ice': 'Hielo',
        'fighting': 'Lucha',
        'poison': 'Veneno',
        'ground': 'Tierra',
        'flying': 'Volador',
        'psychic': 'Psíquico',
        'bug': 'Bicho',
        'rock': 'Roca',
        'ghost': 'Fantasma',
        'dragon': 'Dragón',
        'dark': 'Siniestro',
        'steel': 'Acero',
        'fairy': 'Hada'
    };
    
    return typeTranslations[type.toLowerCase()] || type;
}

function translateStatName(stat) {
    const statTranslations = {
        'hp': 'PS',
        'attack': 'Ataque',
        'defense': 'Defensa',
        'special-attack': 'At. Esp.',
        'special-defense': 'Def. Esp.',
        'speed': 'Velocidad'
    };
    
    return statTranslations[stat] || stat;
}
