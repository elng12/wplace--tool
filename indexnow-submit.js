// IndexNow 客户端禁用占位实现
// 说明：为避免在前端暴露凭据与不可控请求，客户端不再直接提交 IndexNow。
// 请在受保护的服务端或 Serverless 函数中实现提交逻辑，并通过环境变量注入密钥。

class IndexNowSubmitter {
  constructor(host) {
    this.host = host || (typeof location !== 'undefined' ? location.host : '');
  }

  async submitUrls(urls) {
    console.warn('[IndexNow] 客户端已禁用提交。请改用受保护的后端接口。', {
      host: this.host,
      count: Array.isArray(urls) ? urls.length : 0
    });
    return { ok: false, reason: 'client_disabled' };
  }

  async submitUpdatedPages() {
    console.warn('[IndexNow] 客户端示例方法已禁用，未执行。');
    return { ok: false, reason: 'client_disabled' };
  }
}

// 导出实例（可按需使用后端代理接口）
const indexNow = new IndexNowSubmitter();
export { IndexNowSubmitter, indexNow };
