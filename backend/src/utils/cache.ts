// ============================================================================
// Simple In-Memory Cache Utility
// ============================================================================

interface CacheEntry<T> {
    data: T;
    expires: number;
}

class SimpleCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

    /**
     * Get item from cache
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expires) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set item in cache
     */
    set<T>(key: string, data: T, ttlMs: number = this.defaultTTL): void {
        this.cache.set(key, {
            data,
            expires: Date.now() + ttlMs,
        });
    }

    /**
     * Delete item from cache
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Delete all items matching a prefix
     */
    deleteByPrefix(prefix: string): number {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
                count++;
            }
        }
        return count;
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    size(): number {
        return this.cache.size;
    }

    /**
     * Get or set pattern - return cached value or compute and cache
     */
    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttlMs: number = this.defaultTTL
    ): Promise<T> {
        const cached = this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const data = await factory();
        this.set(key, data, ttlMs);
        return data;
    }

    /**
     * Clean up expired entries
     */
    cleanup(): number {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expires) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        return cleaned;
    }
}

// Singleton instance
export const cache = new SimpleCache();

// Cache key generators
export const cacheKeys = {
    skillTree: () => 'skill_tree',
    courseSkills: (courseId: string) => `course_skills:${courseId}`,
    levelSkills: (levelId: string) => `level_skills:${levelId}`,
    userMastery: (userId: string) => `user_mastery:${userId}`,
    foundationLessons: (skillId: string) => `foundation:${skillId}`,
    courseList: () => 'courses_list',
    courseLevels: (courseId: string) => `course_levels:${courseId}`,
};

// TTL constants (in milliseconds)
export const TTL = {
    SHORT: 1 * 60 * 1000,      // 1 minute
    MEDIUM: 5 * 60 * 1000,     // 5 minutes
    LONG: 30 * 60 * 1000,      // 30 minutes
    HOUR: 60 * 60 * 1000,      // 1 hour
    DAY: 24 * 60 * 60 * 1000,  // 24 hours
};

// Cleanup expired entries every 10 minutes
setInterval(() => {
    const cleaned = cache.cleanup();
    if (cleaned > 0) {
        console.log(`[Cache] Cleaned ${cleaned} expired entries`);
    }
}, 10 * 60 * 1000);
