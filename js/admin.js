let products = [];
let nextId = 1;

// 상품 데이터 로드
async function loadProducts() {
    try {
        const response = await fetch('api/get_products.php');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 응답 검증
        if (data.error) {
            throw new Error(data.error);
        }

        if (!Array.isArray(data)) {
            throw new Error('Invalid data format');
        }

        products = data;

        if (products.length > 0) {
            nextId = Math.max(...products.map(p => p.id)) + 1;
        }

        renderProducts();
        updateTotalInfo();
    } catch (error) {
        console.error('상품 로드 실패:', error);
        alert('상품 데이터를 불러오는데 실패했습니다: ' + error.message);
    }
}

// 상품 목록 렌더링
function renderProducts() {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';

    products.forEach((product, index) => {
        const item = document.createElement('div');
        item.className = 'product-item';

        // 안전하게 DOM 요소 생성
        const label = document.createElement('label');
        label.textContent = `ID: ${product.id}`;

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = product.name;
        nameInput.placeholder = '상품명';
        nameInput.addEventListener('change', (e) => updateProduct(index, 'name', e.target.value));

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.value = product.quantity;
        quantityInput.placeholder = '수량';
        quantityInput.min = '0';
        quantityInput.addEventListener('change', (e) => updateProduct(index, 'quantity', parseInt(e.target.value)));

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = product.color;
        colorInput.addEventListener('change', (e) => updateProduct(index, 'color', e.target.value));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '삭제';
        deleteBtn.addEventListener('click', () => deleteProduct(index));

        item.appendChild(label);
        item.appendChild(nameInput);
        item.appendChild(quantityInput);
        item.appendChild(colorInput);
        item.appendChild(deleteBtn);

        productsList.appendChild(item);
    });
}

// 상품 업데이트
function updateProduct(index, field, value) {
    // 입력 검증
    if (field === 'name') {
        if (!value || value.trim() === '') {
            alert('상품명을 입력해주세요.');
            renderProducts();
            return;
        }
        products[index][field] = value.trim();
    } else if (field === 'quantity') {
        const qty = parseInt(value);
        if (isNaN(qty) || qty < 0) {
            alert('수량은 0 이상의 숫자여야 합니다.');
            renderProducts();
            return;
        }
        products[index][field] = qty;
    } else if (field === 'color') {
        if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
            alert('올바른 색상 코드를 입력해주세요.');
            renderProducts();
            return;
        }
        products[index][field] = value;
    } else {
        products[index][field] = value;
    }

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
    totalInfo.textContent = `전체 상품 수: ${products.length}개 | 전체 수량: ${total}개`;
}

// 저장
async function saveProducts() {
    try {
        // 저장 전 데이터 검증
        for (const product of products) {
            if (!product.name || product.name.trim() === '') {
                alert('상품명을 입력해주세요.');
                return;
            }

            if (product.quantity < 0 || !Number.isInteger(product.quantity)) {
                alert('수량은 0 이상의 정수여야 합니다.');
                return;
            }

            if (!/^#[0-9A-Fa-f]{6}$/.test(product.color)) {
                alert('올바른 색상 코드를 입력해주세요.');
                return;
            }
        }

        const response = await fetch('api/save_products.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(products)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            alert('저장되었습니다!');
        } else {
            throw new Error(result.error || '저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('저장 실패:', error);
        alert('저장 중 오류가 발생했습니다: ' + error.message);
    }
}

// 이벤트 리스너
document.getElementById('addBtn').addEventListener('click', addProduct);
document.getElementById('saveBtn').addEventListener('click', saveProducts);

// 초기화
loadProducts();
