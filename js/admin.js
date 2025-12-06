let products = [];
let nextId = 1;

// 상품 데이터 로드
async function loadProducts() {
    try {
        const response = await fetch('api/get_products.php');
        products = await response.json();

        if (products.length > 0) {
            nextId = Math.max(...products.map(p => p.id)) + 1;
        }

        renderProducts();
        updateTotalInfo();
    } catch (error) {
        console.error('상품 로드 실패:', error);
    }
}

// 상품 목록 렌더링
function renderProducts() {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';

    products.forEach((product, index) => {
        const item = document.createElement('div');
        item.className = 'product-item';
        item.innerHTML = `
            <label>ID: ${product.id}</label>
            <input type="text" value="${product.name}" onchange="updateProduct(${index}, 'name', this.value)" placeholder="상품명">
            <input type="number" value="${product.quantity}" onchange="updateProduct(${index}, 'quantity', parseInt(this.value))" placeholder="수량" min="0">
            <input type="color" value="${product.color}" onchange="updateProduct(${index}, 'color', this.value)">
            <button class="delete-btn" onclick="deleteProduct(${index})">삭제</button>
        `;
        productsList.appendChild(item);
    });
}

// 상품 업데이트
function updateProduct(index, field, value) {
    products[index][field] = value;
    updateTotalInfo();
}

// 상품 삭제
function deleteProduct(index) {
    if (confirm('정말 이 상품을 삭제하시겠습니까?')) {
        products.splice(index, 1);
        renderProducts();
        updateTotalInfo();
    }
}

// 상품 추가
function addProduct() {
    const newProduct = {
        id: nextId++,
        name: '새 상품',
        quantity: 100,
        color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    };

    products.push(newProduct);
    renderProducts();
    updateTotalInfo();
}

// 전체 정보 업데이트
function updateTotalInfo() {
    const total = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalInfo = document.getElementById('totalInfo');
    totalInfo.innerHTML = `전체 상품 수: <span>${products.length}</span>개 | 전체 수량: <span>${total}</span>개`;
}

// 저장
async function saveProducts() {
    try {
        const response = await fetch('api/save_products.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(products)
        });

        const result = await response.json();

        if (result.success) {
            alert('저장되었습니다!');
        } else {
            alert('저장 실패: ' + result.error);
        }
    } catch (error) {
        console.error('저장 실패:', error);
        alert('저장 중 오류가 발생했습니다.');
    }
}

// 이벤트 리스너
document.getElementById('addBtn').addEventListener('click', addProduct);
document.getElementById('saveBtn').addEventListener('click', saveProducts);

// 초기화
loadProducts();
