"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { Pencil, Trash2, Plus, FolderOpen, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['\"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function AdminCategoriesPage() {
  const categories = useQuery(api.categories.listAll)
  const createCategory = useMutation(api.categories.create)
  const updateCategory = useMutation(api.categories.update)
  const removeCategory = useMutation(api.categories.remove)

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [sortOrder, setSortOrder] = useState("")
  const [isActive, setIsActive] = useState(true)

  const [editingCategory, setEditingCategory] = useState<{
    id: Id<"categories">
    name: string
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug && name) setSlug(slugify(name))
  }, [name, slug])

  useEffect(() => {
    if (editingCategory) return
    if (sortOrder.trim()) return
    if (!categories) return
    const next = categories.length === 0 ? 1 : Math.max(...categories.map((c) => c.sortOrder)) + 1
    setSortOrder(String(next))
  }, [categories, sortOrder, editingCategory])

  const parsed = useMemo(() => {
    const normalizedSlug = slugify(slug)
    const sortOrderNumber = Number.isFinite(Number(sortOrder))
      ? Math.floor(Number(sortOrder))
      : NaN

    return {
      normalizedSlug,
      sortOrderNumber,
      description: description.trim() ? description.trim() : undefined,
      imageUrl: imageUrl.trim() ? imageUrl.trim() : undefined,
    }
  }, [description, imageUrl, slug, sortOrder])

  const resetForm = () => {
    setName("")
    setSlug("")
    setDescription("")
    setImageUrl("")
    setSortOrder("")
    setIsActive(true)
    setEditingCategory(null)
    setError(null)
  }

  const openCreate = () => {
    setEditingCategory(null)
    resetForm()
    setIsSheetOpen(true)
  }

  const startEditing = (category: NonNullable<typeof categories>[number]) => {
    setError(null)
    setEditingCategory({ id: category._id, name: category.name })
    setName(category.name)
    setSlug(category.slug)
    setDescription(category.description ?? "")
    setImageUrl(category.imageUrl ?? "")
    setSortOrder(String(category.sortOrder))
    setIsActive(category.isActive)
    setIsSheetOpen(true)
  }

  const onSubmit = async () => {
    setError(null)

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError("Name is required")
      return
    }

    if (!parsed.normalizedSlug) {
      setError("Slug is required")
      return
    }

    if (!Number.isFinite(parsed.sortOrderNumber) || parsed.sortOrderNumber < 0) {
      setError("Sort order must be 0 or greater")
      return
    }

    try {
      setIsSaving(true)
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          name: trimmedName,
          slug: parsed.normalizedSlug,
          description: parsed.description,
          imageUrl: parsed.imageUrl,
          isActive,
          sortOrder: parsed.sortOrderNumber,
        })
        toast.success("Category updated")
        setIsSheetOpen(false)
        resetForm()
      } else {
        await createCategory({
          name: trimmedName,
          slug: parsed.normalizedSlug,
          description: parsed.description,
          imageUrl: parsed.imageUrl,
          isActive,
          sortOrder: parsed.sortOrderNumber,
        })
        toast.success("Category created")
        setIsSheetOpen(false)
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setIsSaving(false)
    }
  }

  const onDelete = async (id: Id<"categories">) => {
    try {
      await removeCategory({ id })
      toast.success("Category deleted")
    } catch (err) {
      toast.error("Failed to delete category")
    }
  }

  if (!categories) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8 text-[#1d4ed8]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h2 font-serif font-semibold text-[#002684]">
            Categories
          </h1>
          <p className="text-body text-[#002684]/70">
            Organize your products into categories
          </p>
        </div>
        <Button onClick={openCreate} className="h-10 rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Main Content */}
      <Card className="rounded-2xl shadow-sm overflow-hidden border-0 ring-1 ring-gray-200">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium text-gray-900">{categories.length}</span> categories
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead className="min-w-[200px]">Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Sort Order</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FolderOpen className="h-8 w-8 mb-2 opacity-20" />
                      <p>No categories yet</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((c) => (
                  <TableRow key={String(c._id)} className="hover:bg-gray-50/50 border-gray-100 group">
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-[#002684]">{c.name}</span>
                        <span className="text-xs text-gray-500 font-mono">/{c.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                        {c.description || <span className="text-gray-400 italic">No description</span>}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-gray-700">{c.sortOrder}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "h-5 px-1.5 text-[10px] font-medium border-0",
                        c.isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      )}>
                        {c.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => startEditing(c)} className="h-8 w-8 text-gray-500 hover:text-[#1d4ed8] hover:bg-blue-50">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove <strong>{c.name}</strong> from the store.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(c._id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-serif text-[#002684]">
              {editingCategory ? "Edit Category" : "New Category"}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)] pr-4">
            <div className="flex flex-col gap-6 pb-20">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Core Info */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category Name" />
                </div>
                <div className="grid gap-2">
                  <Label>Slug</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/</span>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="pl-6 font-mono text-sm"
                      placeholder="category-slug"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-24"
                  placeholder="Describe this category..."
                />
              </div>

              {/* Image URL */}
              <div className="grid gap-2">
                <Label>Image URL (optional)</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {imageUrl && (
                  <div className="mt-2 rounded-lg border overflow-hidden">
                    <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover" onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }} />
                  </div>
                )}
              </div>

              {/* Sort Order & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Sort Order</Label>
                  <Input
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    type="number"
                    placeholder="1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 h-10 border rounded-md px-3 bg-white">
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                    <span className="text-sm font-medium text-gray-600">{isActive ? "Active" : "Hidden"}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
            <Button className="flex-1 bg-[#1d4ed8]" onClick={onSubmit} disabled={isSaving}>
              {isSaving && <Spinner className="mr-2 h-4 w-4" />}
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
