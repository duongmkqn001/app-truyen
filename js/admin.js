// =====================================================
// ADMIN SERVICE LAYER
// Admin-only database operations
// =====================================================

const admin = {
    // =====================================================
    // USER MANAGEMENT
    // =====================================================
    
    users: {
        // Get all users
        async getAll() {
            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get users error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },
        
        // Ban user
        async ban(userId) {
            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .update({ is_banned: true })
                    .eq('id', userId)
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Ban user error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Unban user
        async unban(userId) {
            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .update({ is_banned: false })
                    .eq('id', userId)
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Unban user error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Change user role
        async changeRole(userId, newRole) {
            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .update({ role: newRole })
                    .eq('id', userId)
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Change role error:', error);
                return { success: false, error: error.message };
            }
        }
    },
    
    // =====================================================
    // NOVEL MANAGEMENT
    // =====================================================
    
    novels: {
        // Get all novels (including unapproved)
        async getAll() {
            try {
                const { data, error } = await supabaseClient
                    .from('novels_with_stats')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get all novels error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },
        
        // Get pending approval novels
        async getPending() {
            try {
                const { data, error } = await supabaseClient
                    .from('novels')
                    .select('*')
                    .eq('is_approved', false)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get pending novels error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },
        
        // Approve novel
        async approve(novelId) {
            try {
                const { data, error } = await supabaseClient
                    .from('novels')
                    .update({ is_approved: true })
                    .eq('id', novelId)
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Approve novel error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Update novel
        async update(novelId, updates) {
            try {
                const { data, error } = await supabaseClient
                    .from('novels')
                    .update(updates)
                    .eq('id', novelId)
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Update novel error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Delete novel
        async delete(novelId) {
            try {
                const { error } = await supabaseClient
                    .from('novels')
                    .delete()
                    .eq('id', novelId);
                
                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Delete novel error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Assign tags to novel
        async assignTags(novelId, tagIds) {
            try {
                // First, remove existing tags
                await supabaseClient
                    .from('novel_tags')
                    .delete()
                    .eq('novel_id', novelId);
                
                // Then insert new tags
                const tagAssignments = tagIds.map(tagId => ({
                    novel_id: novelId,
                    tag_id: tagId
                }));
                
                const { data, error } = await supabaseClient
                    .from('novel_tags')
                    .insert(tagAssignments)
                    .select();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Assign tags error:', error);
                return { success: false, error: error.message };
            }
        }
    },
    
    // =====================================================
    // CONTENT MODERATION
    // =====================================================
    
    moderation: {
        // Get all reports
        async getReports(status = null) {
            try {
                let query = supabaseClient
                    .from('reports')
                    .select(`
                        *,
                        reporter:users!reports_reported_by_fkey(username),
                        resolver:users!reports_resolved_by_fkey(username)
                    `)
                    .order('created_at', { ascending: false });
                
                if (status) {
                    query = query.eq('status', status);
                }
                
                const { data, error } = await query;
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get reports error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },
        
        // Resolve report
        async resolveReport(reportId) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');
                
                const { data, error } = await supabaseClient
                    .from('reports')
                    .update({
                        status: 'resolved',
                        resolved_by: user.id,
                        resolved_at: new Date().toISOString()
                    })
                    .eq('id', reportId)
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Resolve report error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Dismiss report
        async dismissReport(reportId) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');
                
                const { data, error } = await supabaseClient
                    .from('reports')
                    .update({
                        status: 'dismissed',
                        resolved_by: user.id,
                        resolved_at: new Date().toISOString()
                    })
                    .eq('id', reportId)
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Dismiss report error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Delete flagged comment
        async deleteComment(commentId) {
            try {
                const { error } = await supabaseClient
                    .from('comments')
                    .delete()
                    .eq('id', commentId);
                
                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Delete comment error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Delete flagged review
        async deleteReview(reviewId) {
            try {
                const { error } = await supabaseClient
                    .from('reviews')
                    .delete()
                    .eq('id', reviewId);
                
                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Delete review error:', error);
                return { success: false, error: error.message };
            }
        }
    },
    
    // =====================================================
    // STATISTICS
    // =====================================================
    
    stats: {
        // Get dashboard statistics
        async getDashboard() {
            try {
                // Get counts in parallel
                const [usersResult, novelsResult, commentsResult, ratingsResult] = await Promise.all([
                    supabaseClient.from('users').select('id', { count: 'exact', head: true }),
                    supabaseClient.from('novels').select('id', { count: 'exact', head: true }),
                    supabaseClient.from('comments').select('id', { count: 'exact', head: true }),
                    supabaseClient.from('ratings').select('id', { count: 'exact', head: true })
                ]);
                
                return {
                    success: true,
                    data: {
                        totalUsers: usersResult.count || 0,
                        totalNovels: novelsResult.count || 0,
                        totalComments: commentsResult.count || 0,
                        totalRatings: ratingsResult.count || 0
                    }
                };
            } catch (error) {
                console.error('Get stats error:', error);
                return { success: false, error: error.message };
            }
        }
    }
};

// Export admin service
window.admin = admin;

