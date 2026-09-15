// scripts/fetch-sector-trigger-news.js
// Fetches all news articles from sector-trigger API and stores them in Supabase.

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sectorsApiKey = process.env.SECTORS_API_KEY;

if (!supabaseUrl || !supabaseKey || !sectorsApiKey) {
  console.error('Missing required environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SECTORS_API_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SECTOR_TRIGGER_API_URL = 'https://api.sector-trigger.open/news';
const LIMIT = 50;

async function fetchAllNews() {
  let offset = 0;
  let totalProcessed = 0;
  let hasMore = true;

  while (hasMore) {
    console.log(`[offset=${offset}] Fetching page...`);
    
    try {
      const response = await axios.get(SECTOR_TRIGGER_API_URL, {
        params: {
          access_key: sectorsApiKey,
          limit: LIMIT,
          offset: offset
        }
      });

      const result = response.data;
      const newsItems = result.results || [];

      if (newsItems.length === 0) {
        console.log('No more news items found.');
        break;
      }

      // Prepare records for upsert
      const records = newsItems.map(item => ({
        source_url: item.source,
        title: item.title,
        body: item.body,
        thumbnail_url: item.thumbnail,
        timestamp: item.timestamp,
        sector: item.sector,
        sub_sectors: item.sub_sector,
        symbols: item.symbols,
        tags: item.tags,
        dimensions: item.dimension,
        raw: item
      }));

      // Upsert records into Supabase
      const { error } = await supabase
        .from('sector_trigger_news')
        .upsert(records, {
          onConflict: 'source_url'
        });

      if (error) {
        console.error('Error upserting records:', JSON.stringify(error, null, 2));
        continue;
      }

      totalProcessed += records.length;
      console.log(`[offset=${offset}] Processed ${records.length} items. Total so far: ${totalProcessed}`);

      // Check pagination
      const pagination = result.pagination;
      hasMore = pagination.has_next;
      offset += LIMIT;

    } catch (error) {
      console.error(`Error fetching page [offset=${offset}]:`, JSON.stringify(error.response?.data || error.message, null, 2));
      break;
    }
  }

  console.log(`✅ Selesai. Total berita yang diproses: ${totalProcessed}`);
}

fetchAllNews().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});