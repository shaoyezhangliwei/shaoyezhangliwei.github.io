// 添加错误处理
const initializeSwiper = () => {
    try {
        const swiper = new Swiper('.swiper', {
            loop: true,
            pagination: {
                el: '.swiper-pagination',
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            autoplay: {
                delay: 3000,
            },
        });

        const profileSwiper = new Swiper('.profile-swiper', {
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.profile-swiper .swiper-pagination',
                clickable: true,
            },
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            }
        });

        // 鼠标悬停时暂停自动播放
        const profileSwiperEl = document.querySelector('.profile-swiper');
        if (profileSwiperEl) {
            profileSwiperEl.addEventListener('mouseenter', () => {
                profileSwiper.autoplay.stop();
            });
            
            profileSwiperEl.addEventListener('mouseleave', () => {
                profileSwiper.autoplay.start();
            });
        }
    } catch (error) {
        console.error('Swiper initialization error:', error);
    }
};

// 确保DOM加载完成后再初始化
document.addEventListener('DOMContentLoaded', initializeSwiper);

// 添加DeepSeek API配置
const DEEPSEEK_API_KEY = 'sk-7a0639cda9214a889d5917387defdaea';
const DEEPSEEK_API_URL = 'https://api.deepseek.ai/v1/chat/completions';

// 添加AI对话控制函数
function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.toggle('active');
}

// 修改发送消息函数
async function sendMessage() {
    const input = document.getElementById('userInput');
    const messages = document.getElementById('chatMessages');
    const userMessage = input.value.trim();
    
    if (userMessage !== '') {
        try {
            // 添加用户消息到界面
            const userDiv = document.createElement('div');
            userDiv.className = 'message user';
            userDiv.textContent = userMessage;
            messages.appendChild(userDiv);
            
            // 清空输入
            input.value = '';
            
            // 显示加载状态
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message bot';
            loadingDiv.textContent = '思考中...';
            messages.appendChild(loadingDiv);
            
            // 调用DeepSeek API
            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个专业的技术助手，擅长解答编程相关问题。请用简洁专业的方式回答问题。'
                        },
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // 移除加载状态消息
            messages.removeChild(loadingDiv);
            
            // 添加AI回复
            const botDiv = document.createElement('div');
            botDiv.className = 'message bot';
            botDiv.textContent = data.choices[0].message.content;
            messages.appendChild(botDiv);
            
            // 滚动到底部
            messages.scrollTop = messages.scrollHeight;
            
        } catch (error) {
            console.error('API调用错误:', error);
            // 显示详细的错误信息
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message error';
            errorDiv.textContent = `调用API时出错: ${error.message}`;
            messages.appendChild(errorDiv);
        }
    }
}

// 添加回车发送功能
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 初始化聊天窗口
document.addEventListener('DOMContentLoaded', () => {
    // 初始化Swiper
    initializeSwiper();
    
    // 初始化聊天窗口
    const chatToggle = document.querySelector('.chat-toggle');
    const chatWindow = document.getElementById('chatWindow');
    
    // 点击其他区域关闭聊天窗口
    document.addEventListener('click', (e) => {
        if (!chatWindow.contains(e.target) && !chatToggle.contains(e.target)) {
            chatWindow.classList.remove('active');
        }
    });
    
    // 阻止聊天窗口内的点击事件冒泡
    chatWindow.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}); 