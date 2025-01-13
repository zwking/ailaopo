// 错误处理
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

// 全局变量
let tableCounter = 1;
let myChart = null;
const tables = new Map();
const defaultColors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666',
    '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
];

// 初始化图表
function initializeChart() {
    try {
        const chartDom = document.getElementById('chartArea');
        if (!chartDom) {
            console.error('Chart container not found');
            return;
        }
        if (!myChart && window.echarts) {
            myChart = echarts.init(chartDom);
            console.log('Chart initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

// 确保在 DOM 和所有资源加载完成后初始化
window.addEventListener('load', function() {
    // 初始化第一个表格数据
    tables.set('table1', {
        colors: [...defaultColors],
        data: null
    });

    // 初始化图表
    initializeChart();

    // 初始化事件监听
    initEventListeners();
});

// 集中管理事件监听
function initEventListeners() {
    try {
        // 添加表格按钮
        const addTableBtn = document.getElementById('addTable');
        if (addTableBtn) {
            addTableBtn.addEventListener('click', handleAddTable);
        }
        
        // 生成图表按钮
        const generateChartBtn = document.getElementById('generateChart');
        if (generateChartBtn) {
            generateChartBtn.addEventListener('click', handleGenerateChart);
        }
        
        // 数据对比按钮
        const compareChartsBtn = document.getElementById('compareCharts');
        if (compareChartsBtn) {
            compareChartsBtn.addEventListener('click', handleCompareCharts);
        }
        
        // 主题切换
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', handleThemeChange);
        }
        
        // 窗口大小改变
        window.addEventListener('resize', debounce(() => {
            if (myChart) {
                myChart.resize();
            }
        }, 250));

        // 初始化第一个表格的事件
        initTableEvents('table1');
    } catch (error) {
        console.error('Error initializing event listeners:', error);
    }
}

// 处理生成图表事件
function handleGenerateChart() {
    try {
        const activeTableId = document.querySelector('.tab-pane.active').id;
        const data = getTableData(activeTableId);
        tables.get(activeTableId).data = data;
        
        if (!myChart) {
            console.error('Chart not initialized');
            initializeChart();
        }
        
        if (myChart) {
            const option = generateChartOption(document.getElementById('chartType').value, data);
            myChart.setOption(option, true);
        }
    } catch (error) {
        console.error('Error generating chart:', error);
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 初始化第一个表格
tables.set('table1', {
    colors: [...defaultColors],
    data: null
});

// 添加新表格
document.getElementById('addTable').addEventListener('click', function() {
    tableCounter++;
    const tableId = `table${tableCounter}`;
    
    // 创建新的标签页
    const tabItem = document.createElement('li');
    tabItem.className = 'nav-item';
    tabItem.role = 'presentation';
    tabItem.innerHTML = `
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#${tableId}" type="button" role="tab" aria-selected="false">
            <span class="table-name" contenteditable="true">表格${tableCounter}</span>
            <i class="fas fa-times ms-2 delete-tab" style="display: none;"></i>
        </button>
    `;
    
    // 创建新的表格内容
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-pane fade';
    tabContent.id = tableId;
    tabContent.role = 'tabpanel';
    tabContent.innerHTML = `
        <div class="card mb-4">
            <div class="card-body">
                <h5 class="card-title">数据输入</h5>
                <div class="table-responsive">
                    <table class="table table-bordered data-table" id="dataTable${tableCounter}">
                        <thead>
                            <tr id="headerRow${tableCounter}">
                                <th class="type-column">类型/月份</th>
                                <th>
                                    <div class="d-flex align-items-center">
                                        <input type="text" class="form-control form-control-sm month-input" value="1月">
                                        <button class="btn btn-sm btn-link delete-column p-0">
                                            <i class="fas fa-times text-danger"></i>
                                        </button>
                                    </div>
                                </th>
                                <th class="add-column-header">
                                    <button class="btn btn-sm btn-link add-column">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <input type="text" class="form-control form-control-sm" value="深空入职数">
                                        <button class="btn btn-sm btn-link delete-row p-0">
                                            <i class="fas fa-times text-danger"></i>
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <input type="number" class="form-control form-control-sm" value="0">
                                </td>
                                <td class="add-column-cell"></td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3">
                                    <button class="btn btn-sm btn-secondary w-100 add-row">
                                        <i class="fas fa-plus"></i> 添加新行
                                    </button>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // 添加到DOM
    document.getElementById('tableTabs').appendChild(tabItem);
    document.getElementById('tableContents').appendChild(tabContent);
    
    // 存储新表格信息
    tables.set(tableId, {
        colors: [...defaultColors],
        data: null
    });
    
    // 初始化新表格的事件
    initTableEvents(tableId);
    
    // 切换到新标签页
    const newTab = new bootstrap.Tab(tabItem.querySelector('.nav-link'));
    newTab.show();
});

// 标签页切换时更新颜色选择器和重新绑定事件
document.getElementById('tableTabs').addEventListener('shown.bs.tab', function(e) {
    const newTableId = e.target.getAttribute('data-bs-target').substring(1);
    updateColorPickers();
    
    // 确保事件绑定到新激活的表格
    setTimeout(() => {
        initTableEvents(newTableId);
    }, 0);
});

// 删除标签页
document.getElementById('tableTabs').addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-tab') || e.target.parentElement.classList.contains('delete-tab')) {
        e.stopPropagation(); // 阻止事件冒泡
        const tabButton = e.target.closest('.nav-link');
        const tableId = tabButton.getAttribute('data-bs-target').substring(1);
        
        if (tables.size <= 1) {
            alert('至少需要保留一个表格！');
            return;
        }
        
        // 如果删除的是当前活动的标签页，需要激活其他标签页
        if (tabButton.classList.contains('active')) {
            const otherTableId = Array.from(tables.keys()).find(id => id !== tableId);
            if (otherTableId) {
                // 先切换到其他标签页
                const otherTab = document.querySelector(`[data-bs-target="#${otherTableId}"]`);
                const otherPane = document.getElementById(otherTableId);
                
                // 手动切换标签页
                document.querySelectorAll('.nav-link').forEach(tab => {
                    tab.classList.remove('active');
                    tab.setAttribute('aria-selected', 'false');
                });
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active', 'show');
                });
                
                otherTab.classList.add('active');
                otherTab.setAttribute('aria-selected', 'true');
                otherPane.classList.add('active', 'show');
                
                // 删除当前标签页和内容
                e.target.closest('.nav-item').remove();
                document.getElementById(tableId).remove();
                tables.delete(tableId);
                
                // 重新初始化事件
                setTimeout(() => {
                    initTableEvents(otherTableId);
                    updateColorPickers();
                }, 0);
            }
        } else {
            // 如果删除的不是当前活动的标签页，直接删除即可
            e.target.closest('.nav-item').remove();
            document.getElementById(tableId).remove();
            tables.delete(tableId);
        }
    }
});

// 初始化表格事件
function initTableEvents(tableId) {
    const table = document.getElementById(`dataTable${tableId.replace('table', '')}`);
    if (!table) return;
    
    // 绑定表格名称编辑事件
    const tabButton = document.querySelector(`[data-bs-target="#${tableId}"]`);
    const tableNameSpan = tabButton.querySelector('.table-name');
    
    // 防止点击表格名称时触发标签页切换
    tableNameSpan.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // 防止按回车键换行，而是失去焦点
    tableNameSpan.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
    });
    
    // 清除旧的事件监听器
    const oldAddColumn = table.querySelector('.add-column');
    const oldAddRow = table.querySelector('.add-row');
    
    const newAddColumn = oldAddColumn.cloneNode(true);
    const newAddRow = oldAddRow.cloneNode(true);
    
    oldAddColumn.parentNode.replaceChild(newAddColumn, oldAddColumn);
    oldAddRow.parentNode.replaceChild(newAddRow, oldAddRow);
    
    // 添加列
    newAddColumn.addEventListener('click', function() {
        const headerRow = table.querySelector('thead tr');
        const newIndex = headerRow.getElementsByTagName('th').length - 1;
        
        const newHeader = document.createElement('th');
        newHeader.innerHTML = `
            <div class="d-flex align-items-center">
                <input type="text" class="form-control form-control-sm month-input" value="${newIndex}月">
                <button class="btn btn-sm btn-link delete-column p-0">
                    <i class="fas fa-times text-danger"></i>
                </button>
            </div>
        `;
        
        headerRow.insertBefore(newHeader, headerRow.lastElementChild);
        
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        for (let row of rows) {
            const newCell = document.createElement('td');
            newCell.innerHTML = '<input type="number" class="form-control form-control-sm" value="0">';
            row.insertBefore(newCell, row.lastElementChild);
        }
        
        const footerCell = table.querySelector('tfoot td');
        footerCell.setAttribute('colspan', newIndex + 2);
        
        bindDeleteColumnEvents(table);
    });
    
    // 添加行
    newAddRow.addEventListener('click', function() {
        const tbody = table.getElementsByTagName('tbody')[0];
        const columnCount = table.querySelector('thead tr').getElementsByTagName('th').length - 2;
        const newRow = document.createElement('tr');
        
        let typeCell = document.createElement('td');
        typeCell.innerHTML = `
            <div class="d-flex align-items-center">
                <input type="text" class="form-control form-control-sm" value="新数据系列">
                <button class="btn btn-sm btn-link delete-row p-0">
                    <i class="fas fa-times text-danger"></i>
                </button>
            </div>
        `;
        newRow.appendChild(typeCell);
        
        for (let i = 0; i < columnCount; i++) {
            let dataCell = document.createElement('td');
            dataCell.innerHTML = '<input type="number" class="form-control form-control-sm" value="0">';
            newRow.appendChild(dataCell);
        }
        
        let addColumnCell = document.createElement('td');
        addColumnCell.className = 'add-column-cell';
        newRow.appendChild(addColumnCell);
        
        tbody.appendChild(newRow);
        updateColorPickers();
        
        bindDeleteRowEvents(table);
    });
    
    // 重新绑定删除事件
    bindDeleteColumnEvents(table);
    bindDeleteRowEvents(table);
}

// 绑定删除列按钮事件
function bindDeleteColumnEvents(table) {
    table.querySelectorAll('.delete-column').forEach((button, index) => {
        button.onclick = function() {
            const headerRow = table.querySelector('thead tr');
            if (headerRow.getElementsByTagName('th').length <= 3) {
                alert('至少需要保留一列数据！');
                return;
            }
            
            const columnIndex = index + 1;
            const rows = table.getElementsByTagName('tr');
            
            for (let row of rows) {
                if (row.children[columnIndex]) {
                    row.removeChild(row.children[columnIndex]);
                }
            }
            
            const footerCell = table.querySelector('tfoot td');
            footerCell.setAttribute('colspan', headerRow.getElementsByTagName('th').length);
        };
    });
}

// 绑定删除行按钮事件
function bindDeleteRowEvents(table) {
    table.querySelectorAll('.delete-row').forEach(button => {
        button.onclick = function() {
            const tbody = table.getElementsByTagName('tbody')[0];
            if (tbody.getElementsByTagName('tr').length <= 1) {
                alert('至少需要保留一行数据！');
                return;
            }
            
            const row = this.closest('tr');
            tbody.removeChild(row);
            updateColorPickers();
        };
    });
}

// 更新颜色选择器
function updateColorPickers() {
    const activeTableId = document.querySelector('.tab-pane.active').id;
    const table = document.querySelector(`#${activeTableId} .data-table`);
    const rowCount = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr').length;
    
    const seriesColors = document.getElementById('seriesColors');
    seriesColors.innerHTML = '';
    
    for (let i = 0; i < rowCount; i++) {
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.className = 'color-picker';
        colorPicker.value = tables.get(activeTableId).colors[i] || defaultColors[i % defaultColors.length];
        seriesColors.appendChild(colorPicker);
    }
}

// 从表格获取数据
function getTableData(tableId) {
    const table = document.querySelector(`#${tableId} .data-table`);
    const headerRow = table.querySelector('thead tr');
    const headers = Array.from(headerRow.getElementsByTagName('th'))
        .slice(1, -1)
        .map(th => th.querySelector('input').value);
    
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    const series = [];
    
    Array.from(rows).forEach((row, index) => {
        const inputs = row.getElementsByTagName('input');
        const name = inputs[0].value;
        const data = Array.from(inputs).slice(1).map(input => Number(input.value));
        const color = document.querySelectorAll('.color-picker')[index].value;
        
        series.push({
            name: name,
            data: data,
            color: color
        });
    });
    
    return { categories: headers, series };
}

// 生成图表配置
function generateChartOption(type, data, isComparison = false) {
    const { categories, series } = data;
    // 在函数开始处定义 latestIndex
    const latestIndex = categories.length - 1;
    
    const baseOption = {
        title: {
            text: isComparison ? '数据对比分析' : '招聘数据分析',
            left: 'center'
        },
        tooltip: {
            trigger: type === 'pie' || type === 'funnel' || type === 'nightingale' ? 'item' : 'axis',
            formatter: type === 'gauge' ? '{a} <br/>{b} : {c}' : undefined
        },
        legend: {
            data: series.map(s => s.name),
            top: 25
        },
        toolbox: {
            feature: {
                saveAsImage: {},
                dataZoom: {},
                restore: {}
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: type !== 'pie' && type !== 'radar' && type !== 'gauge' && type !== 'funnel' && type !== 'nightingale' ? {
            type: 'category',
            data: categories,
            name: document.getElementById('xAxisTitle').value
        } : undefined,
        yAxis: type !== 'pie' && type !== 'radar' && type !== 'gauge' && type !== 'funnel' && type !== 'nightingale' ? {
            type: 'value',
            name: document.getElementById('yAxisTitle').value
        } : undefined
    };

    switch (type) {
        case 'line':
            return {
                ...baseOption,
                series: series.map(s => ({
                    name: s.name,
                    type: 'line',
                    data: s.data,
                    smooth: true,
                    lineStyle: {
                        width: 3,
                        color: s.color
                    },
                    itemStyle: {
                        color: s.color
                    }
                }))
            };
        
        case 'bar':
            return {
                ...baseOption,
                series: series.map(s => ({
                    name: s.name,
                    type: 'bar',
                    data: s.data,
                    itemStyle: {
                        color: s.color
                    }
                }))
            };
        
        case 'stackBar':
            return {
                ...baseOption,
                series: series.map(s => ({
                    name: s.name,
                    type: 'bar',
                    stack: 'total',
                    data: s.data,
                    itemStyle: {
                        color: s.color
                    }
                }))
            };
        
        case 'multiLine':
            return {
                ...baseOption,
                series: series.map(s => ({
                    name: s.name,
                    type: 'line',
                    data: s.data,
                    smooth: true,
                    lineStyle: {
                        width: 2,
                        color: s.color
                    },
                    itemStyle: {
                        color: s.color
                    },
                    symbol: 'circle',
                    symbolSize: 8
                }))
            };

        case 'area':
            return {
                ...baseOption,
                series: series.map(s => ({
                    name: s.name,
                    type: 'line',
                    data: s.data,
                    smooth: true,
                    areaStyle: {
                        opacity: 0.3,
                        color: s.color
                    },
                    lineStyle: {
                        color: s.color
                    },
                    itemStyle: {
                        color: s.color
                    }
                }))
            };

        case 'stackArea':
            return {
                ...baseOption,
                series: series.map(s => ({
                    name: s.name,
                    type: 'line',
                    data: s.data,
                    smooth: true,
                    stack: 'total',
                    areaStyle: {
                        opacity: 0.3,
                        color: s.color
                    },
                    lineStyle: {
                        color: s.color
                    },
                    itemStyle: {
                        color: s.color
                    }
                }))
            };

        case 'scatter':
            return {
                ...baseOption,
                series: series.map(s => ({
                    name: s.name,
                    type: 'scatter',
                    data: s.data.map((value, index) => [categories[index], value]),
                    itemStyle: {
                        color: s.color
                    },
                    symbolSize: 12
                }))
            };

        case 'radar':
            const indicators = categories.map(category => ({
                name: category,
                max: Math.max(...series.flatMap(s => s.data)) * 1.2
            }));
            return {
                ...baseOption,
                radar: {
                    indicator: indicators,
                    radius: '65%'
                },
                series: [{
                    type: 'radar',
                    data: series.map(s => ({
                        name: s.name,
                        value: s.data,
                        itemStyle: {
                            color: s.color
                        },
                        areaStyle: {
                            color: s.color,
                            opacity: 0.3
                        }
                    }))
                }]
            };

        case 'pie':
            // 使用最新的数据作为饼图数据
            const latestIndex = categories.length - 1;
            return {
                ...baseOption,
                series: [{
                    type: 'pie',
                    radius: '65%',
                    center: ['50%', '60%'],
                    data: series.map(s => ({
                        name: s.name,
                        value: s.data[latestIndex],
                        itemStyle: {
                            color: s.color
                        }
                    })),
                    label: {
                        formatter: '{b}: {c} ({d}%)'
                    }
                }]
            };

        case 'nightingale':
            // 使用所有时间点的平均值
            const avgData = series.map(s => ({
                name: s.name,
                value: Math.round(s.data.reduce((a, b) => a + b, 0) / s.data.length),
                itemStyle: {
                    color: s.color
                }
            })).filter(item => item.value > 0);

            return {
                ...baseOption,
                series: [{
                    type: 'pie',
                    radius: [20, '65%'],
                    center: ['50%', '60%'],
                    roseType: 'area',
                    itemStyle: {
                        borderRadius: 8
                    },
                    data: avgData.length > 0 ? avgData : [{
                        name: '暂无数据',
                        value: 1,
                        itemStyle: { color: '#ccc' }
                    }],
                    label: {
                        formatter: '{b}: {c}'
                    }
                }]
            };

        case 'gauge':
            // 使用每个系列的平均值
            const gaugeSeriesData = series.map(s => ({
                name: s.name,
                value: Math.round(s.data.reduce((a, b) => a + b, 0) / s.data.length),
                itemStyle: {
                    color: s.color
                }
            }));
            
            // 计算所有数据的最大值
            const maxValue = Math.max(
                ...series.flatMap(s => s.data),
                ...gaugeSeriesData.map(s => s.value)
            ) * 1.2 || 100; // 如果没有有效数据，使用100作为默认最大值
            
            return {
                ...baseOption,
                series: gaugeSeriesData.map((item, index) => ({
                    name: item.name,
                    type: 'gauge',
                    min: 0,
                    max: maxValue,
                    progress: {
                        show: true,
                        color: item.itemStyle.color
                    },
                    axisLine: {
                        lineStyle: {
                            width: 20,
                            color: [[1, item.itemStyle.color]]
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        length: 15,
                        lineStyle: {
                            width: 2,
                            color: '#999'
                        }
                    },
                    pointer: {
                        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                        length: '12%',
                        width: 20,
                        offsetCenter: [0, '-60%'],
                        itemStyle: {
                            color: item.itemStyle.color
                        }
                    },
                    title: {
                        offsetCenter: [0, index * 30 + '%'],
                        fontSize: 14,
                        color: '#333'
                    },
                    detail: {
                        valueAnimation: true,
                        offsetCenter: [0, (index * 30 + 20) + '%'],
                        formatter: '{value}',
                        color: '#333'
                    },
                    data: [{
                        value: item.value,
                        name: item.name
                    }]
                }))
            };

        case 'funnel':
            // 使用所有时间点的平均值
            const funnelData = series.map(s => ({
                name: s.name,
                value: Math.round(s.data.reduce((a, b) => a + b, 0) / s.data.length),
                itemStyle: {
                    color: s.color
                }
            }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);

            const maxFunnelValue = Math.max(...funnelData.map(d => d.value)) * 1.2 || 100;

            return {
                ...baseOption,
                series: [{
                    type: 'funnel',
                    left: '10%',
                    top: 60,
                    bottom: 60,
                    width: '80%',
                    min: 0,
                    max: maxFunnelValue,
                    gap: 2,
                    label: {
                        show: true,
                        position: 'inside',
                        formatter: '{b}: {c}'
                    },
                    labelLine: {
                        length: 10,
                        lineStyle: {
                            width: 1,
                            type: 'solid'
                        }
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1
                    },
                    emphasis: {
                        label: {
                            fontSize: 20
                        }
                    },
                    data: funnelData.length > 0 ? funnelData : [{
                        name: '暂无数据',
                        value: 1,
                        itemStyle: { color: '#ccc' }
                    }]
                }]
            };
    }
}

// 生成单个表格的图表
document.getElementById('generateChart').addEventListener('click', function() {
    const activeTableId = document.querySelector('.tab-pane.active').id;
    const data = getTableData(activeTableId);
    tables.get(activeTableId).data = data; // 保存数据
    
    const option = generateChartOption(chartType.value, data);
    myChart.setOption(option, true);
});

// 数据对比
document.getElementById('compareCharts').addEventListener('click', function() {
    if (tables.size < 2) {
        alert('需要至少两个表格才能进行数据对比！');
        return;
    }
    
    // 收集所有表格的数据
    const allSeries = [];
    for (const [tableId, tableInfo] of tables) {
        if (!tableInfo.data) {
            tableInfo.data = getTableData(tableId);
        }
        
        const tableName = document.querySelector(`[data-bs-target="#${tableId}"]`).textContent.trim();
        tableInfo.data.series.forEach(s => {
            allSeries.push({
                ...s,
                name: `${tableName}-${s.name}`
            });
        });
    }
    
    // 使用第一个表格的类别作为基准
    const firstTableData = tables.get(Array.from(tables.keys())[0]).data;
    const comparisonData = {
        categories: firstTableData.categories,
        series: allSeries
    };
    
    const option = generateChartOption(chartType.value, comparisonData, true);
    myChart.setOption(option, true);
});

// 主题切换
document.getElementById('themeSelect').addEventListener('change', function() {
    document.body.className = this.value === 'default' ? '' : `theme-${this.value}`;
    document.getElementById('generateChart').click();
});

// 窗口大小改变时调整图表大小
window.addEventListener('resize', () => {
    myChart.resize();
});

// 初始化第一个表格的事件
initTableEvents('table1'); 