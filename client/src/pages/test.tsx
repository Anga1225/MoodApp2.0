export function TestPage() {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">測試頁面</h1>
        <p className="text-blue-700">如果您看到這個頁面，路由正常工作！</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          返回
        </button>
      </div>
    </div>
  );
}