// =====================================================
// DATABASE SERVICE LAYER
// All Supabase database operations
// =====================================================

const db = {
    // =====================================================
    // AUTHENTICATION
    // =====================================================
    
    auth: {
        // Sign up new user
        async signUp(email, password, username) {
            try {
                console.log('Starting sign up process...', { email, username });

                // Create auth user with username in metadata
                // The database trigger will automatically create the profile
                const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username
                        }
                    }
                });

                if (authError) {
                    console.error('Auth sign up error:', authError);
                    throw authError;
                }

                console.log('Auth user created successfully:', authData.user.id);
                console.log('User profile will be created automatically by database trigger');

                return { success: true, user: authData.user };
            } catch (error) {
                console.error('Sign up error:', error);
                console.error('Full error object:', {
                    message: error.message,
                    name: error.name,
                    status: error.status,
                    statusCode: error.statusCode,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                return { success: false, error: error.message };
            }
        },
        
        // Sign in
        async signIn(email, password) {
            try {
                console.log('Attempting sign in...', { email });

                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    console.error('Sign in error:', error);
                    console.error('Error details:', {
                        message: error.message,
                        status: error.status,
                        name: error.name
                    });
                    throw error;
                }

                console.log('Sign in successful:', data.user.id);
                return { success: true, user: data.user };
            } catch (error) {
                console.error('Sign in error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Sign out
        async signOut() {
            try {
                const { error } = await supabaseClient.auth.signOut();
                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Sign out error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Get current user
        async getCurrentUser() {
            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                return user;
            } catch (error) {
                console.error('Get user error:', error);
                return null;
            }
        },
        
        // Get user profile with role
        async getUserProfile(userId) {
            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();
                
                if (error) throw error;
                return data;
            } catch (error) {
                console.error('Get profile error:', error);
                return null;
            }
        },
        
        // Check if user is admin
        async isAdmin() {
            try {
                const user = await this.getCurrentUser();
                if (!user) return false;

                const profile = await this.getUserProfile(user.id);
                return profile && profile.role === 'admin' && !profile.is_banned;
            } catch (error) {
                console.error('Check admin error:', error);
                return false;
            }
        },

        // Get all users (admin only)
        async getAllUsers(limit = 100, offset = 0) {
            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .range(offset, offset + limit - 1);

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get all users error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },

        // Get pending users (admin only)
        async getPendingUsers() {
            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .select('*')
                    .eq('role', 'pending_approval')
                    .order('created_at', { ascending: true });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get pending users error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },

        // Approve user (admin only)
        async approveUser(userId) {
            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .update({
                        role: 'reader',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId)
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Approve user error:', error);
                return { success: false, error: error.message };
            }
        },

        // Ban user (admin only)
        async banUser(userId) {
            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .update({
                        is_banned: true,
                        updated_at: new Date().toISOString()
                    })
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

        // Unban user (admin only)
        async unbanUser(userId) {
            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .update({
                        is_banned: false,
                        updated_at: new Date().toISOString()
                    })
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

        // Update user role (admin only)
        async updateUserRole(userId, newRole) {
            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .update({
                        role: newRole,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId)
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Update user role error:', error);
                return { success: false, error: error.message };
            }
        },

        // Delete user (admin only)
        async deleteUser(userId) {
            try {
                // First delete from users table (this will cascade to auth.users)
                const { error } = await supabaseClient
                    .from('users')
                    .delete()
                    .eq('id', userId);

                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Delete user error:', error);
                return { success: false, error: error.message };
            }
        }
    },
    
    // =====================================================
    // NOVELS
    // =====================================================
    
    novels: {
        // Get all approved novels with stats
        async getAll(limit = 100, offset = 0) {
            try {
                const { data, error } = await supabaseClient
                    .from('novels_with_stats')
                    .select('*')
                    .eq('is_approved', true)
                    .order('created_at', { ascending: false })
                    .range(offset, offset + limit - 1);
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get novels error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },
        
        // Get single novel by ID
        async getById(id) {
            try {
                const { data, error } = await supabaseClient
                    .from('novels_with_stats')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get novel error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Search novels by title
        async search(query) {
            try {
                const { data, error } = await supabaseClient
                    .from('novels_with_stats')
                    .select('*')
                    .eq('is_approved', true)
                    .ilike('title', `%${query}%`)
                    .order('avg_rating', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Search novels error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },
        
        // Filter by tag
        async getByTag(tagName) {
            try {
                const { data, error } = await supabaseClient
                    .from('novels_with_stats')
                    .select('*')
                    .eq('is_approved', true)
                    .contains('tag_names', [tagName])
                    .order('avg_rating', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get novels by tag error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },
        
        // Filter by author
        async getByAuthor(authorName) {
            try {
                const { data, error } = await supabaseClient
                    .from('novels_with_stats')
                    .select('*')
                    .eq('is_approved', true)
                    .ilike('author_name', `%${authorName}%`)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get novels by author error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },
        
        // Filter by editor
        async getByEditor(editorName) {
            try {
                const { data, error } = await supabaseClient
                    .from('novels_with_stats')
                    .select('*')
                    .eq('is_approved', true)
                    .ilike('editor_name', `%${editorName}%`)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get novels by editor error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },
        
        // Get top rated novels
        async getTopRated(limit = 10) {
            try {
                const { data, error } = await supabaseClient
                    .from('novels_with_stats')
                    .select('*')
                    .eq('is_approved', true)
                    .order('avg_rating', { ascending: false })
                    .order('rating_count', { ascending: false })
                    .limit(limit);
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get top rated error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },
        
        // Get most nominated novels
        async getMostNominated(limit = 10) {
            try {
                const { data, error } = await supabaseClient
                    .from('novels_with_stats')
                    .select('*')
                    .eq('is_approved', true)
                    .order('nomination_count', { ascending: false })
                    .limit(limit);
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get most nominated error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },
        
        // Create novel (requires authentication)
        async create(novelData) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                // Get user profile to check role
                const profile = await db.auth.getUserProfile(user.id);

                // Determine approval status based on role
                let approvalStatus = 'pending';
                let isApproved = false;

                if (profile && (profile.role === 'translator' || profile.role === 'admin')) {
                    approvalStatus = 'approved';
                    isApproved = true;
                }

                // Extract tag_ids from novelData
                const tagIds = novelData.tag_ids;
                delete novelData.tag_ids;

                // Validate tags if provided
                if (tagIds && tagIds.length > 0) {
                    // Check if all tags exist
                    const { data: existingTags, error: tagError } = await supabaseClient
                        .from('tags')
                        .select('id')
                        .in('id', tagIds);

                    if (tagError) throw tagError;

                    if (existingTags.length !== tagIds.length) {
                        throw new Error('Một hoặc nhiều thể loại không tồn tại. Vui lòng chỉ chọn từ danh sách có sẵn.');
                    }
                }

                const { data, error } = await supabaseClient
                    .from('novels')
                    .insert({
                        ...novelData,
                        created_by: user.id,
                        approval_status: approvalStatus,
                        is_approved: isApproved,
                        approved_at: isApproved ? new Date().toISOString() : null,
                        approved_by: isApproved ? user.id : null
                    })
                    .select()
                    .single();

                if (error) throw error;

                // Add tags if provided
                if (tagIds && tagIds.length > 0 && data) {
                    const novelTagsData = tagIds.map(tagId => ({
                        novel_id: data.id,
                        tag_id: tagId
                    }));

                    const { error: novelTagsError } = await supabaseClient
                        .from('novel_tags')
                        .insert(novelTagsData);

                    if (novelTagsError) {
                        console.error('Error adding tags:', novelTagsError);
                        // Don't fail the whole operation if tags fail
                    }
                }

                return {
                    success: true,
                    data,
                    needsApproval: !isApproved
                };
            } catch (error) {
                console.error('Create novel error:', error);
                return { success: false, error: error.message };
            }
        },

        // Bulk create novels from CSV (requires authentication)
        async bulkCreate(novelsArray) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                // Get user profile to check role
                const profile = await db.auth.getUserProfile(user.id);

                // Determine approval status based on role
                let approvalStatus = 'pending';
                let isApproved = false;

                if (profile && (profile.role === 'translator' || profile.role === 'admin')) {
                    approvalStatus = 'approved';
                    isApproved = true;
                }

                // Extract tag_ids from each novel and prepare novel data
                const novelsWithTags = novelsArray.map(novel => {
                    const tagIds = novel.tag_ids;
                    delete novel.tag_ids;
                    return { novel, tagIds };
                });

                // Add metadata to each novel
                const novelsWithMetadata = novelsWithTags.map(({ novel }) => ({
                    ...novel,
                    created_by: user.id,
                    approval_status: approvalStatus,
                    is_approved: isApproved,
                    approved_at: isApproved ? new Date().toISOString() : null,
                    approved_by: isApproved ? user.id : null
                }));

                const { data, error } = await supabaseClient
                    .from('novels')
                    .insert(novelsWithMetadata)
                    .select();

                if (error) throw error;

                // Add tags for each novel
                const allNovelTags = [];
                data.forEach((novel, index) => {
                    const tagIds = novelsWithTags[index].tagIds;
                    if (tagIds && tagIds.length > 0) {
                        tagIds.forEach(tagId => {
                            allNovelTags.push({
                                novel_id: novel.id,
                                tag_id: tagId
                            });
                        });
                    }
                });

                // Insert all novel-tag associations
                if (allNovelTags.length > 0) {
                    const { error: tagsError } = await supabaseClient
                        .from('novel_tags')
                        .insert(allNovelTags);

                    if (tagsError) {
                        console.error('Error adding tags to novels:', tagsError);
                        // Don't fail the whole operation if tags fail
                    }
                }

                return { success: true, data, count: data.length };
            } catch (error) {
                console.error('Bulk create novels error:', error);
                return { success: false, error: error.message };
            }
        },

        // Get pending novels (admin/translator only)
        async getPending() {
            try {
                const { data, error } = await supabaseClient
                    .from('novels_with_approval')
                    .select('*')
                    .eq('approval_status', 'pending')
                    .order('created_at', { ascending: true });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get pending novels error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },

        // Approve novel (admin only)
        async approve(novelId) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .from('novels')
                    .update({
                        approval_status: 'approved',
                        is_approved: true,
                        approved_by: user.id,
                        approved_at: new Date().toISOString()
                    })
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

        // Reject novel (admin only)
        async reject(novelId, reason = '') {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .from('novels')
                    .update({
                        approval_status: 'rejected',
                        is_approved: false,
                        rejected_reason: reason,
                        approved_by: user.id,
                        approved_at: new Date().toISOString()
                    })
                    .eq('id', novelId)
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Reject novel error:', error);
                return { success: false, error: error.message };
            }
        },

        // Update novel (admin only)
        async update(novelId, updateData) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                // Extract tag_ids if present
                const tagIds = updateData.tag_ids;
                delete updateData.tag_ids;

                // Update novel data
                const { data, error } = await supabaseClient
                    .from('novels')
                    .update(updateData)
                    .eq('id', novelId)
                    .select()
                    .single();

                if (error) throw error;

                // Update tags if provided
                if (tagIds !== undefined) {
                    // Delete existing tags
                    await supabaseClient
                        .from('novel_tags')
                        .delete()
                        .eq('novel_id', novelId);

                    // Insert new tags
                    if (tagIds && tagIds.length > 0) {
                        const novelTags = tagIds.map(tagId => ({
                            novel_id: novelId,
                            tag_id: tagId
                        }));

                        const { error: tagsError } = await supabaseClient
                            .from('novel_tags')
                            .insert(novelTags);

                        if (tagsError) {
                            console.error('Error updating tags:', tagsError);
                            // Don't fail the whole operation if tags fail
                        }
                    }
                }

                return { success: true, data };
            } catch (error) {
                console.error('Update novel error:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // =====================================================
    // RATINGS
    // =====================================================

    ratings: {
        // Get user's rating for a novel
        async getUserRating(novelId, userId) {
            try {
                const { data, error } = await supabaseClient
                    .from('ratings')
                    .select('*')
                    .eq('novel_id', novelId)
                    .eq('user_id', userId)
                    .maybeSingle();

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get user rating error:', error);
                return { success: false, error: error.message };
            }
        },

        // Create or update rating
        async upsert(novelId, rating) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .from('ratings')
                    .upsert({
                        novel_id: novelId,
                        user_id: user.id,
                        rating: rating
                    })
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Upsert rating error:', error);
                return { success: false, error: error.message };
            }
        },

        // Delete rating
        async delete(novelId) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { error } = await supabaseClient
                    .from('ratings')
                    .delete()
                    .eq('novel_id', novelId)
                    .eq('user_id', user.id);

                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Delete rating error:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // =====================================================
    // COMMENTS
    // =====================================================

    comments: {
        // Get comments for a novel
        async getByNovel(novelId, limit = 50) {
            try {
                const { data, error } = await supabaseClient
                    .from('comments')
                    .select(`
                        *,
                        users (username)
                    `)
                    .eq('novel_id', novelId)
                    .eq('is_flagged', false)
                    .order('created_at', { ascending: false })
                    .limit(limit);

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get comments error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },

        // Create comment
        async create(novelId, content) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .from('comments')
                    .insert({
                        novel_id: novelId,
                        user_id: user.id,
                        content: content
                    })
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Create comment error:', error);
                return { success: false, error: error.message };
            }
        },

        // Update comment
        async update(commentId, content) {
            try {
                const { data, error } = await supabaseClient
                    .from('comments')
                    .update({ content })
                    .eq('id', commentId)
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Update comment error:', error);
                return { success: false, error: error.message };
            }
        },

        // Delete comment
        async delete(commentId) {
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
        }
    },

    // =====================================================
    // REVIEWS
    // =====================================================

    reviews: {
        // Get reviews for a novel
        async getByNovel(novelId) {
            try {
                const { data, error } = await supabaseClient
                    .from('reviews')
                    .select(`
                        *,
                        users (username)
                    `)
                    .eq('novel_id', novelId)
                    .eq('is_flagged', false)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get reviews error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },

        // Create or update review
        async upsert(novelId, reviewText) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .from('reviews')
                    .upsert({
                        novel_id: novelId,
                        user_id: user.id,
                        review_text: reviewText
                    })
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Upsert review error:', error);
                return { success: false, error: error.message };
            }
        },

        // Delete review
        async delete(reviewId) {
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
    // NOMINATIONS
    // =====================================================

    nominations: {
        // Check if user nominated a novel
        async hasNominated(novelId) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) return { success: true, data: false };

                const { data, error } = await supabaseClient
                    .from('nominations')
                    .select('id')
                    .eq('novel_id', novelId)
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (error) throw error;
                return { success: true, data: !!data };
            } catch (error) {
                console.error('Check nomination error:', error);
                return { success: false, error: error.message };
            }
        },

        // Nominate a novel
        async create(novelId) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .from('nominations')
                    .insert({
                        novel_id: novelId,
                        user_id: user.id
                    })
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Create nomination error:', error);
                return { success: false, error: error.message };
            }
        },

        // Remove nomination
        async delete(novelId) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { error } = await supabaseClient
                    .from('nominations')
                    .delete()
                    .eq('novel_id', novelId)
                    .eq('user_id', user.id);

                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Delete nomination error:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // =====================================================
    // TAGS
    // =====================================================

    tags: {
        // Get all tags
        async getAll() {
            try {
                const { data, error } = await supabaseClient
                    .from('tags')
                    .select('*')
                    .order('name');

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get tags error:', error);
                return { success: false, error: error.message, data: [] };
            }
        }
    },

    // =====================================================
    // TRANSLATOR REQUESTS
    // =====================================================

    translatorRequests: {
        // Create translator request
        async create(requestMessage) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .from('translator_requests')
                    .insert({
                        user_id: user.id,
                        request_message: requestMessage,
                        status: 'pending'
                    })
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Create translator request error:', error);
                return { success: false, error: error.message };
            }
        },

        // Get user's translator requests
        async getByUser(userId) {
            try {
                const { data, error } = await supabaseClient
                    .from('translator_requests')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get translator requests error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },

        // Get pending requests (admin only)
        async getPending() {
            try {
                const { data, error } = await supabaseClient
                    .from('translator_requests')
                    .select(`
                        *,
                        users!translator_requests_user_id_fkey(username, role)
                    `)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: true });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get pending translator requests error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },

        // Approve request (admin only)
        async approve(requestId, adminNotes = '') {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .rpc('approve_translator_request', {
                        request_id: requestId,
                        admin_id: user.id,
                        notes: adminNotes
                    });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Approve translator request error:', error);
                return { success: false, error: error.message };
            }
        },

        // Reject request (admin only)
        async reject(requestId, adminNotes = '') {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .rpc('reject_translator_request', {
                        request_id: requestId,
                        admin_id: user.id,
                        notes: adminNotes
                    });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Reject translator request error:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // =====================================================
    // ROLE UPGRADE REQUESTS
    // =====================================================

    roleUpgradeRequests: {
        // Create role upgrade request
        async create(requestedRole, requestMessage, websiteUrl = null, proofImageUrl = null) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const profile = await db.auth.getUserProfile(user.id);
                if (!profile) throw new Error('User profile not found');

                const { data, error } = await supabaseClient
                    .from('role_upgrade_requests')
                    .insert({
                        user_id: user.id,
                        from_role: profile.role,  // Changed from current_role
                        to_role: requestedRole,   // Changed from requested_role
                        request_message: requestMessage,
                        website_url: websiteUrl,
                        proof_image_url: proofImageUrl,
                        status: 'pending'
                    })
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Create role upgrade request error:', error);
                return { success: false, error: error.message };
            }
        },

        // Get user's own role upgrade requests
        async getUserRequests() {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .from('role_upgrade_requests')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get user role upgrade requests error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },

        // Get all pending role upgrade requests (admin only)
        async getPendingRequests() {
            try {
                const { data, error } = await supabaseClient
                    .from('role_upgrade_requests')
                    .select(`
                        *,
                        users!role_upgrade_requests_user_id_fkey(username, email, role, created_at)
                    `)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: true });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get pending role upgrade requests error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },

        // Get all role upgrade requests (admin only)
        async getAllRequests() {
            try {
                const { data, error } = await supabaseClient
                    .from('role_upgrade_requests')
                    .select(`
                        *,
                        users!role_upgrade_requests_user_id_fkey(username, email, role, created_at)
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get all role upgrade requests error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },

        // Approve role upgrade request (admin only)
        async approve(requestId, adminNotes = '') {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .rpc('approve_role_upgrade_request', {
                        request_uuid: requestId,
                        admin_uuid: user.id,
                        notes: adminNotes
                    });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Approve role upgrade request error:', error);
                return { success: false, error: error.message };
            }
        },

        // Reject role upgrade request (admin only)
        async reject(requestId, adminNotes = '') {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .rpc('reject_role_upgrade_request', {
                        request_uuid: requestId,
                        admin_uuid: user.id,
                        notes: adminNotes
                    });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Reject role upgrade request error:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // =====================================================
    // LIKES (for comments and reviews)
    // =====================================================

    likes: {
        // Toggle like/dislike
        async toggle(targetType, targetId, isLike) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                // Check if user already voted
                const { data: existing } = await supabaseClient
                    .from('likes')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('target_type', targetType)
                    .eq('target_id', targetId)
                    .maybeSingle();

                if (existing) {
                    // If same vote, remove it
                    if (existing.is_like === isLike) {
                        const { error } = await supabaseClient
                            .from('likes')
                            .delete()
                            .eq('id', existing.id);

                        if (error) throw error;
                        return { success: true, action: 'removed' };
                    } else {
                        // Change vote
                        const { error } = await supabaseClient
                            .from('likes')
                            .update({ is_like: isLike, updated_at: new Date().toISOString() })
                            .eq('id', existing.id);

                        if (error) throw error;
                        return { success: true, action: 'changed' };
                    }
                } else {
                    // Create new vote
                    const { error } = await supabaseClient
                        .from('likes')
                        .insert({
                            user_id: user.id,
                            target_type: targetType,
                            target_id: targetId,
                            is_like: isLike
                        });

                    if (error) throw error;
                    return { success: true, action: 'created' };
                }
            } catch (error) {
                console.error('Toggle like error:', error);
                return { success: false, error: error.message };
            }
        },

        // Get user's vote on an item
        async getUserVote(targetType, targetId) {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) return { success: true, data: null };

                const { data, error } = await supabaseClient
                    .from('likes')
                    .select('is_like')
                    .eq('user_id', user.id)
                    .eq('target_type', targetType)
                    .eq('target_id', targetId)
                    .maybeSingle();

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get user vote error:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // =====================================================
    // REPORTS
    // =====================================================

    reports: {
        // Create a report
        async create(reportType, contentId, reason, details = '') {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .from('reports')
                    .insert({
                        reported_by: user.id,
                        report_type: reportType, // 'comment', 'review', 'novel', 'user'
                        content_id: contentId,
                        reason: reason,
                        details: details,
                        status: 'pending'
                    })
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Create report error:', error);
                return { success: false, error: error.message };
            }
        },

        // Get all reports (admin only)
        async getAll() {
            try {
                const { data, error } = await supabaseClient
                    .from('reports')
                    .select(`
                        *,
                        reporter:reported_by(username),
                        resolver:resolved_by(username)
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get reports error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },

        // Get pending reports (admin only)
        async getPending() {
            try {
                const { data, error } = await supabaseClient
                    .from('reports')
                    .select(`
                        *,
                        reporter:reported_by(username)
                    `)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Get pending reports error:', error);
                return { success: false, error: error.message, data: [] };
            }
        },

        // Resolve a report (admin only)
        async resolve(reportId, action = 'resolved') {
            try {
                const user = await db.auth.getCurrentUser();
                if (!user) throw new Error('Must be logged in');

                const { data, error } = await supabaseClient
                    .from('reports')
                    .update({
                        status: action, // 'resolved' or 'dismissed'
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
        }
    }
};

// Export database service
window.db = db;

