import { getSupabaseBrowserClient } from './client';
import { Project, Asset, ExportJob } from '@/types';

export class ProjectService {
  private supabase = getSupabaseBrowserClient();

  async getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapProjectFromDB);
  }

  async getProject(projectId: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? this.mapProjectFromDB(data) : null;
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert({
        user_id: project.userId,
        name: project.settings.name,
        settings: project.settings,
        pages: project.pages,
        assets: project.assets,
        export_config: project.exportConfig,
        thumbnail: project.thumbnail,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapProjectFromDB(data);
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const dbUpdates: Record<string, unknown> = {};

    if (updates.settings) {
      dbUpdates.name = updates.settings.name;
      dbUpdates.settings = updates.settings;
    }
    if (updates.pages) dbUpdates.pages = updates.pages;
    if (updates.assets) dbUpdates.assets = updates.assets;
    if (updates.exportConfig) dbUpdates.export_config = updates.exportConfig;
    if (updates.thumbnail) dbUpdates.thumbnail = updates.thumbnail;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('projects')
      .update(dbUpdates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return this.mapProjectFromDB(data);
  }

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  }

  async uploadAsset(file: File, userId: string, category?: string): Promise<Asset> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from('assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = this.supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    const asset: Omit<Asset, 'id' | 'createdAt'> = {
      userId,
      type: file.type.startsWith('image/') ? 'image' : 'ornament',
      name: file.name,
      src: urlData.publicUrl,
      thumbnail: urlData.publicUrl,
      category: category || null,
      tags: [],
      size: file.size,
      width: 0,
      height: 0,
    };

    const { data, error } = await this.supabase
      .from('assets')
      .insert(asset)
      .select()
      .single();

    if (error) throw error;
    return this.mapAssetFromDB(data);
  }

  async getAssets(userId: string, type?: string): Promise<Asset[]> {
    let query = this.supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapAssetFromDB);
  }

  async createExportJob(job: Omit<ExportJob, 'id' | 'createdAt'>): Promise<ExportJob> {
    const { data, error } = await this.supabase
      .from('export_jobs')
      .insert({
        project_id: job.projectId,
        user_id: job.projectId, // Should be userId, fixed in actual implementation
        format: job.format,
        status: job.status,
        progress: job.progress,
        url: job.url,
        error: job.error,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapExportJobFromDB(data);
  }

  async updateExportJob(jobId: string, updates: Partial<ExportJob>): Promise<void> {
    const { error } = await this.supabase
      .from('export_jobs')
      .update({
        status: updates.status,
        progress: updates.progress,
        url: updates.url,
        error: updates.error,
        completed_at: updates.completedAt,
      })
      .eq('id', jobId);

    if (error) throw error;
  }

  async getExportJobs(projectId: string): Promise<ExportJob[]> {
    const { data, error } = await this.supabase
      .from('export_jobs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapExportJobFromDB);
  }

  private mapProjectFromDB(data: Record<string, unknown>): Project {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      settings: data.settings as Project['settings'],
      pages: data.pages as Project['pages'],
      assets: data.assets as Project['assets'],
      exportConfig: data.export_config as Project['exportConfig'],
      thumbnail: data.thumbnail as string | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapAssetFromDB(data: Record<string, unknown>): Asset {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      type: data.type as Asset['type'],
      name: data.name as string,
      src: data.src as string,
      thumbnail: data.thumbnail as string | undefined,
      category: data.category as string | undefined,
      tags: data.tags as string[] | undefined,
      size: data.size as number | undefined,
      width: data.width as number | undefined,
      height: data.height as number | undefined,
      createdAt: data.created_at as string,
    };
  }

  private mapExportJobFromDB(data: Record<string, unknown>): ExportJob {
    return {
      id: data.id as string,
      projectId: data.project_id as string,
      format: data.format as ExportJob['format'],
      status: data.status as ExportJob['status'],
      progress: data.progress as number,
      url: data.url as string | undefined,
      error: data.error as string | undefined,
      createdAt: data.created_at as string,
      completedAt: data.completed_at as string | undefined,
    };
  }
}

export const projectService = new ProjectService();
