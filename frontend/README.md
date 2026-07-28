<<<<<<< HEAD
// EvidenceList.module.scss

// Variables
$primary-color: #5d5dff;
$text-color: #333;
$light-gray: #f5f5f5;
$dark-gray: #666;
$card-bg-dark: rgba(0, 0, 0, 0.4);
$blue-border: #007bff;
$card-min-height: 250px;

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

// ... (Header 및 Filter Tabs 스타일 유지)

// --- Evidence Cards Grid Layout ---
.evidenceGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr); 
    gap: 20px;
}

// --- Card Base Styling ---
.card {
    border-radius: 10px;
    min-height: $card-min-height;
    overflow: hidden;
    position: relative;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0;
    transition: transform 0.2s;

    &:hover {
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }
}

// --- Media Card (Image/Video) ---
.mediaCard {
    background-size: cover;
    background-position: center;
    color: white; 
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to top, $card-bg-dark 0%, transparent 50%);
        z-index: 1;
    }
    
    .cardContent {
        padding: 15px;
        position: relative;
        z-index: 2;
    }
    
    .cardTitle {
        margin: 0 0 5px;
        font-size: 1.2rem;
    }

    .submitBtn {
        background: rgba(255, 255, 255, 0.9);
        border: none;
    }
}

// --- Audio/Memo/Document Card (파일 비포함 또는 비-미디어 파일) ---
.audioCard, .memoCard, .documentCard {
    background-color: $light-gray;
    border: 1px solid #ddd;
    color: $text-color;
}

// --- Empty Card (빈 카드) ---
.emptyCard {
    background-color: $light-gray;
    border: 1px solid #ddd;
    box-shadow: none;
    cursor: pointer; // 클릭 가능성을 암시
}

.iconPlaceholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    padding-bottom: 0;
    flex-grow: 1; // 공간을 채우도록 설정
    text-align: center;
    
    .placeholderTitle {
        font-size: 1.1rem;
        font-weight: bold;
        margin-bottom: 15px;
    }

    .audioIcon, .memoIcon, .documentIcon {
        font-size: 2.5rem;
        color: $dark-gray;
    }
}

// --- Selected Card Style (Blue Border) ---
.selectedCard {
    border: 5px solid $blue-border;
    padding: 0;
}

// --- Card Content & Button ---
.cardContent {
    padding: 15px;
    
    p {
        margin: 2px 0;
        font-size: 0.85rem;
    }
}

.submitBtn {
    background: white;
    color: $primary-color;
    border: 1px solid #ddd;
    padding: 5px 10px;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    align-self: flex-end;
    margin: 10px;
    z-index: 3;
}

// --- Pagination (유지) ---
.pagination {
    // ... (스타일 유지)
}

// --- Responsive Adjustments (유지) ---
@media (max-width: 768px) {
    .evidenceGrid {
        grid-template-columns: repeat(2, 1fr); 
    }
}
=======
# scc
>>>>>>> 6722ef045707c726e05e56e6609828b375e95db6
