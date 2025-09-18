// IndexNow自动提交脚本
class IndexNowSubmitter {
    constructor() {
        this.apiKey = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';
        this.host = 'wplacetool.app';
        this.keyLocation = `https://${this.host}/indexnow-key.txt`;
        this.endpoints = [
            'https://api.indexnow.org/indexnow',
            'https://www.bing.com/indexnow',
            'https://yandex.com/indexnow'
        ];
    }

    async submitUrls(urls) {
        const payload = {
            host: this.host,
            key: this.apiKey,
            keyLocation: this.keyLocation,
            urlList: urls
        };

        for (const endpoint of this.endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    console.log(`✅ 成功提交到 ${endpoint}`);
                } else {
                    console.log(`❌ 提交失败到 ${endpoint}: ${response.status}`);
                }
            } catch (error) {
                console.error(`❌ 提交错误到 ${endpoint}:`, error);
            }
        }
    }

    // 提交更新的页面
    async submitUpdatedPages() {
        const updatedUrls = [
            `https://${this.host}/`,
            `https://${this.host}/about.html`,
            `https://${this.host}/color-converter.html`,
            `https://${this.host}/blog.html`,
            `https://${this.host}/privacy.html`,
            `https://${this.host}/terms.html`
        ];

        await this.submitUrls(updatedUrls);
    }
}

// 使用示例
const indexNow = new IndexNowSubmitter();
// indexNow.submitUpdatedPages(); // 取消注释以执行提交