export interface GlobalCountryConfig {
  value: string;         // 国家代码 (如 'CN')，适合作为 Select 的 value
  label: string;         // 国家名称 (如 'China')
  coordinates: [number, number]; // 严格的地图坐标元组 [经度, 纬度]
}

// 缓存变量，确保整个网站在生命周期内只请求一次 API
let countryCache: GlobalCountryConfig[] | null = null;

export const countryService = {
  /**
   * 异步获取全球国家数据表，支持前端本地缓存
   */
  async getGlobalCountries(): Promise<GlobalCountryConfig[]> {
    // 1. 如果有缓存，直接返回，避免重复请求网络
    if (countryCache) return countryCache;

    try {
      const response = await fetch("https://restcountries.com");
      if (!response.ok) throw new Error("Failed to fetch world countries");
      
      const rawData = await response.json();

      // 2. 数据清洗：将 API 返回的结构转化为我们前端表单和地图最需要的干净格式
      const formattedData: GlobalCountryConfig[] = rawData.map((item: any) => {
        // restcountries 返回的是 [lat, lng]，需要逆序适配 react-simple-maps 的 [lng, lat]
        const [lat, lng] = item.latlng || [0, 0];
        
        return {
          value: item.cca2, // 二位国家代码，如 'CN', 'US'
          label: item.name.common, // 通用英文国家名
          coordinates: [lng, lat] as [number, number] // 锁死元组类型
        };
      });
      // 3. 按国家名称字母排序，提升下拉框体验
      formattedData.sort((a, b) => a.label.localeCompare(b.label));

      // 4. 写入缓存并返回
      countryCache = formattedData;
      return formattedData;
    } catch (error) {
      console.error("Geocoding Service Error:", error);
      return []; // 出错时返回空数组防崩溃
    }
  }
};