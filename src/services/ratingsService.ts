/**
 * Ratings Service
 * Manages contractor ratings and feedback.
 * TODO: Create contractor_ratings table in Supabase if not already present.
 * TODO: Implement server-side Edge Function for ratings aggregation and fraud detection.
 */

import { supabase } from '../lib/supabase';
import { ServiceResponse } from '../types';

export interface ContractorRating {
  id?: string;
  company_id: string;
  contractor_id: string;
  contractor_alias?: string;
  rating: number; // 1-5
  comment?: string;
  created_at?: string;
  updated_at?: string;
}

class RatingsService {
  /**
   * Submit a rating for a contractor
   * Requires company_id and permission to rate contractors
   */
  async submitRating(
    companyId: string,
    contractorId: string,
    rating: number,
    comment?: string
  ): Promise<ServiceResponse<ContractorRating>> {
    try {
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: 'Rating must be between 1 and 5',
          code: 'INVALID_RATING'
        };
      }

      const { data, error } = await supabase
        .from('contractor_ratings')
        .insert({
          company_id: companyId,
          contractor_id: contractorId,
          rating,
          comment: comment || null,
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
          code: 'INSERT_ERROR'
        };
      }

      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNKNOWN'
      };
    }
  }

  /**
   * Get ratings for a contractor
   */
  async getRatingsForContractor(
    contractorId: string,
    limit: number = 50
  ): Promise<ServiceResponse<ContractorRating[]>> {
    try {
      const { data, error } = await supabase
        .from('contractor_ratings')
        .select('*')
        .eq('contractor_id', contractorId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          success: false,
          error: error.message,
          code: 'FETCH_ERROR'
        };
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNKNOWN'
      };
    }
  }

  /**
   * Get average rating for a contractor
   * TODO: Move to server-side Edge Function for performance at scale
   */
  async getAverageRating(contractorId: string): Promise<ServiceResponse<{ average: number; count: number }>> {
    try {
      const { data, error } = await supabase
        .from('contractor_ratings')
        .select('rating')
        .eq('contractor_id', contractorId);

      if (error) {
        return {
          success: false,
          error: error.message,
          code: 'FETCH_ERROR'
        };
      }

      const ratings = (data as Array<{ rating: number }>) || [];
      if (ratings.length === 0) {
        return { success: true, data: { average: 0, count: 0 } };
      }

      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      const average = sum / ratings.length;

      return { success: true, data: { average, count: ratings.length } };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNKNOWN'
      };
    }
  }

  /**
   * Update a rating (if permitted)
   */
  async updateRating(
    ratingId: string,
    rating?: number,
    comment?: string
  ): Promise<ServiceResponse<ContractorRating>> {
    try {
      const updates: Record<string, unknown> = {};
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return {
            success: false,
            error: 'Rating must be between 1 and 5',
            code: 'INVALID_RATING'
          };
        }
        updates.rating = rating;
      }
      if (comment !== undefined) {
        updates.comment = comment;
      }

      const { data, error } = await supabase
        .from('contractor_ratings')
        .update(updates)
        .eq('id', ratingId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
          code: 'UPDATE_ERROR'
        };
      }

      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNKNOWN'
      };
    }
  }
}

export const ratingsService = new RatingsService();
export default ratingsService;
