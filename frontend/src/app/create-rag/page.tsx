'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@radix-ui/react-label'
import api from '@/lib/axios'
import { useAuth } from '@/lib/hooks/useAuth'

// Fixed schema - removed files requirement since it's commented out
const RagSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Max 100 characters"),
    description: z
      .string()
      .max(20_000, "Way too long 😅")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    qdrant_collection: z
      .string()
      .min(1, "Collection is required")
      .max(50, "Max 50 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, dashes, and underscores"),
    embedding_model: z.string().min(1, "Embedding model is required"),
    llm_model: z.string().min(1, "LLM model is required"),
    chunk_size: z
      .number()
      .int()
      .min(1, "Must be at least 1")
      .max(100_000, "That is unusually large"),
    chunk_overlap: z
      .number()
      .int()
      .min(0, "Cannot be negative")
      .max(100_000, "Too large"),
    top_k: z
      .number()
      .int()
      .min(1, "At least 1")
      .max(100, "Keep it reasonable (≤100)"),
    document_count: z
      .number()
      .int()
      .min(0, "Cannot be negative"),
    is_active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.chunk_overlap >= data.chunk_size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Overlap must be less than chunk size",
        path: ["chunk_overlap"],
      });
    }
  });

type RagFormValues = z.infer<typeof RagSchema>

export default function RagForm() {
  type User = {
    id: string;
  };

  const { user, loading } = useAuth() as { user: User | null; loading: boolean };
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<RagFormValues>({
    resolver: zodResolver(RagSchema),
    defaultValues: {
      name: '',
      description: '',
      qdrant_collection: '',
      embedding_model: 'text-embedding-3-large',
      llm_model: 'gpt-4o-mini',
      chunk_size: 1000,
      chunk_overlap: 400,
      top_k: 5,
      document_count: 0,
      is_active: true,
    },
  })

  const onSubmit = async (values: RagFormValues) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);
      
      console.log("Submitting RAG config:", values);
      

      const res = await api.post(`/api/v1/user/create/${user?.id}`, values);
      
      console.log("Response:", res.data);
      setSubmitSuccess(true);
      
      // Optional: reset form after successful submission
      // reset();
      
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmitError(error.response?.data?.message || error.message || "Failed to create RAG config");
    }
  }

  const chunkSize = watch('chunk_size')
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="mx-auto mt-20 max-w-3xl">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Success/Error Messages */}
        {submitSuccess && (
          <div className="rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
            RAG configuration saved successfully!
          </div>
        )}
        {submitError && (
          <div className="rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
            {submitError}
          </div>
        )}

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Project Alpha" {...register('name')} />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Optional description of this RAG setup"
            rows={4}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Qdrant collection */}
        <div className="space-y-2">
          <Label htmlFor="qdrant_collection">Qdrant Collection</Label>
          <Input
            id="qdrant_collection"
            placeholder="e.g. docs_prod"
            {...register('qdrant_collection')}
          />
          <p className="text-xs text-muted-foreground">
            Must be unique; use only letters, numbers, dashes, and underscores.
          </p>
          {errors.qdrant_collection && (
            <p className="text-sm text-red-600">{errors.qdrant_collection.message}</p>
          )}
        </div>

        {/* Models */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="embedding_model">Embedding Model</Label>
            <Input
              id="embedding_model"
              placeholder="text-embedding-3-large"
              {...register('embedding_model')}
            />
            {errors.embedding_model && (
              <p className="text-sm text-red-600">{errors.embedding_model.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="llm_model">LLM Model</Label>
            <Input id="llm_model" placeholder="gpt-4o-mini" {...register('llm_model')} />
            {errors.llm_model && (
              <p className="text-sm text-red-600">{errors.llm_model.message}</p>
            )}
          </div>
        </div>

        {/* Chunking params - FIXED with valueAsNumber */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="chunk_size">Chunk Size</Label>
            <Input 
              id="chunk_size" 
              type="number" 
              min={1} 
              step={1} 
              {...register('chunk_size', { valueAsNumber: true })} 
            />
            {errors.chunk_size && (
              <p className="text-sm text-red-600">{errors.chunk_size.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="chunk_overlap">Chunk Overlap</Label>
            <Input
              id="chunk_overlap"
              type="number"
              min={0}
              max={Math.max(0, Number(chunkSize) - 1) || undefined}
              step={1}
              {...register('chunk_overlap', { valueAsNumber: true })}
            />
            {errors.chunk_overlap && (
              <p className="text-sm text-red-600">{errors.chunk_overlap.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="top_k">Top‑K</Label>
            <Input 
              id="top_k" 
              type="number" 
              min={1} 
              max={100} 
              step={1} 
              {...register('top_k', { valueAsNumber: true })} 
            />
            {errors.top_k && (
              <p className="text-sm text-red-600">{errors.top_k.message}</p>
            )}
          </div>
        </div>

        {/* Doc count & Active */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="document_count">Document Count</Label>
            <Input 
              id="document_count" 
              type="number" 
              min={0} 
              step={1} 
              {...register('document_count', { valueAsNumber: true })} 
            />
            {errors.document_count && (
              <p className="text-sm text-red-600">{errors.document_count.message}</p>
            )}
          </div>

          {/* Fixed Switch integration with Controller */}
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <Label htmlFor="is_active">Active</Label>
              <p className="text-xs text-muted-foreground">Toggle whether this RAG is active</p>
            </div>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Switch
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save RAG Config'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => reset()}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}