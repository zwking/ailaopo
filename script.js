// 初始化ECharts实例
const chartDom = document.getElementById('chartArea');
const myChart = echarts.init(chartDom);

// 获取DOM元素
const chartType = document.getElementById('chartType');
const dataInput = document.getElementById('dataInput');
const xAxisTitle = document.getElementById('xAxisTitle');
const yAxisTitle = document.getElementById('yAxisTitle');
const mainColor = document.getElementById('mainColor');
const generateButton = document.getElementById('generateChart');

// 默认的颜色方案
const defaultColors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666',
    '#73c0de', '#3ba272', '#fc8452', '#9a60b4',
    '#ea7ccc', '#4ec2c6'
];

// 解析输入数据
function parseData(input) {
    try {
        // 尝试解析JSON格式
        if (input.trim().startsWith('[') || input.trim().startsWith('{')) {
            const jsonData = JSON.parse(input);
            if (Array.isArray(jsonData)) {
                const categories = [];
                const values = [];
                jsonData.forEach(item => {
                    if (typeof item === 'object') {
                        categories.push(item.name || item.category || '未命名');
                        values.push(parseFloat(item.value || 0));
                    }
                });
                return { categories, values };
            }
        }

        // 解析CSV格式
        const lines = input.trim().split('\n');
        const categories = [];
        const values = [];
        
        lines.forEach(line => {
            const parts = line.split(',').map(part => part.trim());
            if (parts.length >= 2) {
                const value = parseFloat(parts[1]);
                if (!isNaN(value)) {
                    categories.push(parts[0]);
                    values.push(value);
                }
            }
        });
        
        return { categories, values };
    } catch (error) {
        throw new Error('数据格式错误，请检查输入格式是否正确');
    }
}

// 生成图表配置
function generateChartOption(type, data) {
    const { categories, values } = data;
    const color = mainColor.value;
    
    const baseOption = {
        title: {
            text: '自定义图表'
        },
        tooltip: {
            trigger: type === 'pie' ? 'item' : 'axis',
            formatter: type === 'pie' ? '{b}: {c} ({d}%)' : undefined
        }
    };

    switch (type) {
        case 'line':
            return {
                ...baseOption,
                xAxis: {
                    type: 'category',
                    data: categories,
                    name: xAxisTitle.value
                },
                yAxis: {
                    type: 'value',
                    name: yAxisTitle.value
                },
                color: [color],
                series: [{
                    data: values,
                    type: 'line',
                    smooth: true
                }]
            };
        
        case 'bar':
            return {
                ...baseOption,
                xAxis: {
                    type: 'category',
                    data: categories,
                    name: xAxisTitle.value
                },
                yAxis: {
                    type: 'value',
                    name: yAxisTitle.value
                },
                color: [color],
                series: [{
                    data: values,
                    type: 'bar'
                }]
            };
        
        case 'pie':
            return {
                ...baseOption,
                color: defaultColors,
                legend: {
                    orient: 'vertical',
                    left: 'left'
                },
                series: [{
                    type: 'pie',
                    radius: '50%',
                    data: categories.map((name, index) => ({
                        name,
                        value: values[index]
                    })),
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        formatter: '{b}: {c} ({d}%)'
                    }
                }]
            };
        
        case 'scatter':
            return {
                ...baseOption,
                xAxis: {
                    type: 'category',
                    data: categories,
                    name: xAxisTitle.value
                },
                yAxis: {
                    type: 'value',
                    name: yAxisTitle.value
                },
                color: [color],
                series: [{
                    data: values,
                    type: 'scatter',
                    symbolSize: 10
                }]
            };
    }
}

// 生成图表
function generateChart() {
    try {
        const data = parseData(dataInput.value);
        if (data.categories.length === 0) {
            alert('请输入有效的数据！');
            return;
        }
        
        const option = generateChartOption(chartType.value, data);
        myChart.setOption(option, true);
    } catch (error) {
        alert('生成图表时出错：' + error.message);
    }
}

// 更新数据输入框的提示文本
function updatePlaceholder() {
    const type = chartType.value;
    const placeholder = type === 'pie' ? 
        "请输入数据，每行一组，格式：名称,数值\n例如：\n苹果,30\n香蕉,25\n橙子,15\n\n或JSON格式：\n[\n  {\"name\": \"苹果\", \"value\": 30},\n  {\"name\": \"香蕉\", \"value\": 25}\n]" :
        "请输入数据，每行一组，格式：名称,数值\n例如：\n一月,100\n二月,150\n三月,120";
    
    dataInput.placeholder = placeholder;
}

// 事件监听
generateButton.addEventListener('click', generateChart);
chartType.addEventListener('change', updatePlaceholder);

// 初始化提示文本
updatePlaceholder();

// 窗口大小改变时调整图表大小
window.addEventListener('resize', () => {
    myChart.resize();
}); 