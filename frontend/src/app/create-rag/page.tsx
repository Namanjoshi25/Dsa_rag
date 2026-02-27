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

import { useRouter } from 'next/navigation'

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
    // Use z.any() + refine so we don't reference browser `File` at build time (Node has no File)
    documents: z
      .array(z.any())
      .min(1, "At least one file is required")
      .max(3, "Max 3 files can be uploaded")
      .refine(
        (arr) => typeof File !== "undefined" && arr.every((x) => x instanceof File),
        { message: "Invalid file(s)" }
      ),
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

  const router  = useRouter()

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
      documents: []
    },
  })

  const onSubmit = async (values: RagFormValues) => {
    try {
         setSubmitError(null);
    setSubmitSuccess(false);
    
    // Create FormData instead of sending JSON
    const formData = new FormData();
    
    // Append all form fields
    formData.append('name', values.name);
    if (values.description) {
      formData.append('description', values.description);
    }
    formData.append('qdrant_collection', values.qdrant_collection);
    formData.append('embedding_model', values.embedding_model);
    formData.append('llm_model', values.llm_model);
    formData.append('chunk_size', values.chunk_size.toString());
    formData.append('chunk_overlap', values.chunk_overlap.toString());
    formData.append('top_k', values.top_k.toString());
    formData.append('document_count', values.document_count.toString());
    formData.append('is_active', values.is_active.toString());
    
    // Append files
    values.documents.forEach((file) => {
      formData.append('documents', file);
    });
    
    console.log("Submitting RAG with files...");
    
    // Send FormData (axios automatically sets Content-Type: multipart/form-data)
    const res = await api.post(`/api/v1/user/create/${user?.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log("Response:", res.data);
    setSubmitSuccess(true);
    router.push("/dashboard")
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmitError(error.response?.data?.message || error.message || "Failed to create RAG config");
    }
  }

  const chunkSize = watch('chunk_size')
  
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-brand" />
          <span className="text-sm text-zinc-400">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="mx-auto mt-12 max-w-3xl px-4 pb-10">
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Create RAG</h1>
        <p className="mt-0.5 text-sm text-zinc-400">Configure a new retrieval-augmented collection</p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Success/Error Messages */}
        {submitSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-emerald-300">
            RAG configuration saved successfully!
          </div>
        )}
        {submitError && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-red-300">
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
          </div>
        {/* Documents to upload */}
     
     
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
  <div className="space-y-2">
    <Label htmlFor="documents">Documents</Label>
    <Controller
      name="documents"
      control={control}
      render={({ field: { onChange, onBlur, name, ref } }) => (
        <Input
          id="documents"
          type="file"
          multiple
          accept=".pdf,.txt,.docx,.md"
          ref={ref}
          name={name}
          onBlur={onBlur}
          onChange={(e) => {
            const files = e.target.files;
            onChange(files ? Array.from(files) : []);
          }}
        />
      )}
    />
    {errors.documents && (
      <p className="text-sm text-red-600">{errors.documents.message}</p>
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
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-8 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground hover:opacity-90"
          >
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