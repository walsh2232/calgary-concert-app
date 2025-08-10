/**
 * Oracle HCM Analysis Platform Documentation Scripts
 * Provides interactive functionality for the generated documentation
 */

(function() {
    'use strict';

    // Global state
    const state = {
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 20,
        sortBy: 'name',
        sortOrder: 'asc',
        filters: {
            priority: [],
            category: [],
            complexity: [],
            businessValue: []
        }
    };

    // DOM ready handler
    document.addEventListener('DOMContentLoaded', function() {
        initializeDocumentation();
    });

    /**
     * Initialize all documentation functionality
     */
    function initializeDocumentation() {
        setupSearch();
        setupSorting();
        setupFiltering();
        setupPagination();
        setupResponsiveNavigation();
        setupPrintFunctionality();
        setupAccessibility();
        setupAnalytics();
    }

    /**
     * Setup search functionality
     */
    function setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        let searchTimeout;
        
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });

        // Add search button if it exists
        const searchButton = document.querySelector('.search-button');
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                const query = searchInput.value.trim();
                performSearch(query);
            });
        }
    }

    /**
     * Perform search across documentation content
     */
    function performSearch(query) {
        state.searchQuery = query;
        state.currentPage = 1;

        if (!query) {
            showAllContent();
            return;
        }

        const searchResults = searchContent(query);
        displaySearchResults(searchResults);
        updateSearchStats(searchResults.length);
    }

    /**
     * Search content across all documentation
     */
    function searchContent(query) {
        const searchableElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, td, li');
        const results = [];

        searchableElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                const result = {
                    element: element,
                    text: element.textContent,
                    relevance: calculateRelevance(text, query),
                    type: element.tagName.toLowerCase()
                };
                results.push(result);
            }
        });

        // Sort by relevance
        results.sort((a, b) => b.relevance - a.relevance);
        return results;
    }

    /**
     * Calculate search relevance score
     */
    function calculateRelevance(text, query) {
        const queryWords = query.toLowerCase().split(' ');
        let score = 0;

        queryWords.forEach(word => {
            if (text.includes(word)) {
                score += 1;
                // Bonus for exact matches
                if (text.includes(query.toLowerCase())) {
                    score += 2;
                }
                // Bonus for heading matches
                if (text.match(new RegExp(`^${word}`, 'i'))) {
                    score += 1;
                }
            }
        });

        return score;
    }

    /**
     * Display search results
     */
    function displaySearchResults(results) {
        const contentArea = document.querySelector('.container') || document.body;
        const existingResults = document.querySelector('.search-results');
        
        if (existingResults) {
            existingResults.remove();
        }

        if (results.length === 0) {
            showNoResultsMessage();
            return;
        }

        const resultsContainer = createSearchResultsContainer(results);
        contentArea.insertBefore(resultsContainer, contentArea.firstChild);
        
        // Hide other content
        hideNonSearchContent();
    }

    /**
     * Create search results container
     */
    function createSearchResultsContainer(results) {
        const container = document.createElement('div');
        container.className = 'search-results section';
        container.innerHTML = `
            <h2>Search Results for "${state.searchQuery}"</h2>
            <p>Found ${results.length} results</p>
            <div class="search-results-list">
                ${results.map(result => createSearchResultItem(result)).join('')}
            </div>
        `;
        return container;
    }

    /**
     * Create individual search result item
     */
    function createSearchResultItem(result) {
        const excerpt = result.text.substring(0, 150) + (result.text.length > 150 ? '...' : '');
        return `
            <div class="search-result-item">
                <h4>${result.type.toUpperCase()}: ${result.text.substring(0, 100)}</h4>
                <p>${excerpt}</p>
                <button class="btn btn-sm btn-primary" onclick="scrollToElement('${result.element.id || generateElementId(result.element)}')">
                    View
                </button>
            </div>
        `;
    }

    /**
     * Generate unique ID for element if none exists
     */
    function generateElementId(element) {
        const id = 'search-result-' + Math.random().toString(36).substr(2, 9);
        element.id = id;
        return id;
    }

    /**
     * Scroll to specific element
     */
    window.scrollToElement = function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            element.style.backgroundColor = '#fef3c7';
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 2000);
        }
    };

    /**
     * Setup sorting functionality
     */
    function setupSorting() {
        const sortButtons = document.querySelectorAll('[data-sort]');
        sortButtons.forEach(button => {
            button.addEventListener('click', function() {
                const sortBy = this.dataset.sort;
                const currentOrder = state.sortOrder;
                
                if (state.sortBy === sortBy) {
                    state.sortOrder = currentOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    state.sortBy = sortBy;
                    state.sortOrder = 'asc';
                }

                updateSortIndicators();
                performSort();
            });
        });
    }

    /**
     * Update sort indicators
     */
    function updateSortIndicators() {
        const sortButtons = document.querySelectorAll('[data-sort]');
        sortButtons.forEach(button => {
            const sortBy = button.dataset.sort;
            const indicator = button.querySelector('.sort-indicator');
            
            if (indicator) {
                if (state.sortBy === sortBy) {
                    indicator.textContent = state.sortOrder === 'asc' ? '↑' : '↓';
                    button.classList.add('active');
                } else {
                    indicator.textContent = '';
                    button.classList.remove('active');
                }
            }
        });
    }

    /**
     * Perform sorting on table data
     */
    function performSort() {
        const tables = document.querySelectorAll('.table');
        tables.forEach(table => {
            const tbody = table.querySelector('tbody');
            if (!tbody) return;

            const rows = Array.from(tbody.querySelectorAll('tr'));
            const sortedRows = sortTableRows(rows);
            
            // Clear and re-append sorted rows
            tbody.innerHTML = '';
            sortedRows.forEach(row => tbody.appendChild(row));
        });
    }

    /**
     * Sort table rows based on current sort state
     */
    function sortTableRows(rows) {
        return rows.sort((a, b) => {
            const aValue = getCellValue(a, state.sortBy);
            const bValue = getCellValue(b, state.sortBy);
            
            if (state.sortOrder === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
    }

    /**
     * Get cell value for sorting
     */
    function getCellValue(row, sortBy) {
        const cellIndex = getCellIndex(sortBy);
        if (cellIndex >= 0) {
            const cell = row.cells[cellIndex];
            return cell ? cell.textContent.trim() : '';
        }
        return '';
    }

    /**
     * Get cell index for sorting
     */
    function getCellIndex(sortBy) {
        const headerRow = document.querySelector('.table thead tr');
        if (!headerRow) return -1;

        const headers = Array.from(headerRow.querySelectorAll('th'));
        return headers.findIndex(header => 
            header.textContent.toLowerCase().includes(sortBy.toLowerCase())
        );
    }

    /**
     * Setup filtering functionality
     */
    function setupFiltering() {
        const filterInputs = document.querySelectorAll('[data-filter]');
        filterInputs.forEach(input => {
            input.addEventListener('change', function() {
                const filterType = this.dataset.filter;
                const filterValue = this.value;
                
                if (this.checked) {
                    if (!state.filters[filterType].includes(filterValue)) {
                        state.filters[filterType].push(filterValue);
                    }
                } else {
                    const index = state.filters[filterType].indexOf(filterValue);
                    if (index > -1) {
                        state.filters[filterType].splice(index, 1);
                    }
                }

                applyFilters();
            });
        });
    }

    /**
     * Apply current filters
     */
    function applyFilters() {
        const filterableElements = document.querySelectorAll('[data-filterable]');
        
        filterableElements.forEach(element => {
            const shouldShow = shouldShowElement(element);
            element.style.display = shouldShow ? '' : 'none';
        });

        updateFilterStats();
    }

    /**
     * Determine if element should be shown based on filters
     */
    function shouldShowElement(element) {
        for (const [filterType, filterValues] of Object.entries(state.filters)) {
            if (filterValues.length === 0) continue;
            
            const elementValue = element.dataset[filterType];
            if (!filterValues.includes(elementValue)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Setup pagination
     */
    function setupPagination() {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        updatePagination();
        
        // Event delegation for pagination clicks
        paginationContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== state.currentPage) {
                    state.currentPage = page;
                    updatePagination();
                    scrollToTop();
                }
            }
        });
    }

    /**
     * Update pagination display
     */
    function updatePagination() {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        const totalItems = getTotalItems();
        const totalPages = Math.ceil(totalItems / state.itemsPerPage);
        
        paginationContainer.innerHTML = createPaginationHTML(totalPages);
    }

    /**
     * Create pagination HTML
     */
    function createPaginationHTML(totalPages) {
        if (totalPages <= 1) return '';

        let html = '<ul class="pagination-list">';
        
        // Previous button
        if (state.currentPage > 1) {
            html += `<li><a href="#" class="page-link" data-page="${state.currentPage - 1}">Previous</a></li>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === state.currentPage) {
                html += `<li class="active"><span>${i}</span></li>`;
            } else {
                html += `<li><a href="#" class="page-link" data-page="${i}">${i}</a></li>`;
            }
        }

        // Next button
        if (state.currentPage < totalPages) {
            html += `<li><a href="#" class="page-link" data-page="${state.currentPage + 1}">Next</a></li>`;
        }

        html += '</ul>';
        return html;
    }

    /**
     * Setup responsive navigation
     */
    function setupResponsiveNavigation() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuToggle && navLinks) {
            mobileMenuToggle.addEventListener('click', function() {
                navLinks.classList.toggle('active');
                this.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav') && navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (mobileMenuToggle) {
                    mobileMenuToggle.classList.remove('active');
                }
            }
        });
    }

    /**
     * Setup print functionality
     */
    function setupPrintFunctionality() {
        const printButton = document.querySelector('.print-button');
        if (printButton) {
            printButton.addEventListener('click', function() {
                window.print();
            });
        }

        // Add print button to all sections if none exists
        if (!printButton) {
            addPrintButtons();
        }
    }

    /**
     * Add print buttons to sections
     */
    function addPrintButtons() {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            if (!section.querySelector('.print-button')) {
                const printBtn = document.createElement('button');
                printBtn.className = 'btn btn-sm btn-secondary print-button';
                printBtn.innerHTML = '🖨️ Print';
                printBtn.addEventListener('click', () => window.print());
                
                const header = section.querySelector('h2, h3, h4');
                if (header) {
                    header.appendChild(printBtn);
                }
            }
        });
    }

    /**
     * Setup accessibility features
     */
    function setupAccessibility() {
        // Add ARIA labels
        addAriaLabels();
        
        // Setup keyboard navigation
        setupKeyboardNavigation();
        
        // Add skip links
        addSkipLinks();
    }

    /**
     * Add ARIA labels to interactive elements
     */
    function addAriaLabels() {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label')) {
                const text = button.textContent.trim();
                if (text) {
                    button.setAttribute('aria-label', text);
                }
            }
        });

        const links = document.querySelectorAll('a');
        links.forEach(link => {
            if (!link.getAttribute('aria-label') && link.textContent.trim()) {
                link.setAttribute('aria-label', link.textContent.trim());
            }
        });
    }

    /**
     * Setup keyboard navigation
     */
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + F for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Escape to close mobile menu
            if (e.key === 'Escape') {
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
                    if (mobileMenuToggle) {
                        mobileMenuToggle.classList.remove('active');
                    }
                }
            }
        });
    }

    /**
     * Add skip links for accessibility
     */
    function addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
        
        // Add corresponding IDs
        const mainContent = document.querySelector('.container') || document.querySelector('main');
        if (mainContent) {
            mainContent.id = 'main-content';
        }
        
        const navigation = document.querySelector('.nav');
        if (navigation) {
            navigation.id = 'navigation';
        }
    }

    /**
     * Setup analytics tracking
     */
    function setupAnalytics() {
        // Track page views
        trackPageView();
        
        // Track user interactions
        trackUserInteractions();
    }

    /**
     * Track page view
     */
    function trackPageView() {
        const pageTitle = document.title;
        const pageUrl = window.location.href;
        
        // Send analytics data (replace with your analytics service)
        console.log('Page View:', { title: pageTitle, url: pageUrl, timestamp: new Date().toISOString() });
    }

    /**
     * Track user interactions
     */
    function trackUserInteractions() {
        // Track search queries
        document.addEventListener('search', function(e) {
            console.log('Search Query:', e.target.value);
        });

        // Track filter usage
        document.addEventListener('filter', function(e) {
            console.log('Filter Applied:', e.detail);
        });

        // Track print events
        window.addEventListener('beforeprint', function() {
            console.log('Print Started');
        });
    }

    /**
     * Utility functions
     */
    function showAllContent() {
        const hiddenElements = document.querySelectorAll('.search-hidden');
        hiddenElements.forEach(element => {
            element.style.display = '';
            element.classList.remove('search-hidden');
        });
        
        const searchResults = document.querySelector('.search-results');
        if (searchResults) {
            searchResults.remove();
        }
    }

    function hideNonSearchContent() {
        const contentElements = document.querySelectorAll('.section, .metadata');
        contentElements.forEach(element => {
            if (!element.classList.contains('search-results')) {
                element.style.display = 'none';
                element.classList.add('search-hidden');
            }
        });
    }

    function showNoResultsMessage() {
        const contentArea = document.querySelector('.container') || document.body;
        const existingResults = document.querySelector('.search-results');
        
        if (existingResults) {
            existingResults.remove();
        }

        const noResults = document.createElement('div');
        noResults.className = 'search-results section';
        noResults.innerHTML = `
            <h2>No Results Found</h2>
            <p>No results found for "${state.searchQuery}". Try different keywords or check your spelling.</p>
        `;
        
        contentArea.insertBefore(noResults, contentArea.firstChild);
    }

    function updateSearchStats(resultCount) {
        const statsElement = document.querySelector('.search-stats');
        if (statsElement) {
            statsElement.textContent = `Found ${resultCount} results for "${state.searchQuery}"`;
        }
    }

    function updateFilterStats() {
        const visibleElements = document.querySelectorAll('[data-filterable]:not([style*="display: none"])');
        const totalElements = document.querySelectorAll('[data-filterable]');
        
        const statsElement = document.querySelector('.filter-stats');
        if (statsElement) {
            statsElement.textContent = `Showing ${visibleElements.length} of ${totalElements.length} items`;
        }
    }

    function getTotalItems() {
        return document.querySelectorAll('[data-filterable]').length;
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Export functions for global access
    window.DocumentationManager = {
        search: performSearch,
        sort: performSort,
        filter: applyFilters,
        reset: function() {
            state.searchQuery = '';
            state.currentPage = 1;
            state.filters = {
                priority: [],
                category: [],
                complexity: [],
                businessValue: []
            };
            showAllContent();
            updateSortIndicators();
            applyFilters();
            updatePagination();
        }
    };

})();