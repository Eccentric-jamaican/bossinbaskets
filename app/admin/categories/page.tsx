"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function AdminCategoriesPage() {
  const categories = useQuery(api.categories.listAll)
  const createCategory = useMutation(api.categories.create)
  const updateCategory = useMutation(api.categories.update)
  const removeCategory = useMutation(api.categories.remove)

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
  const [success, setSuccess] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: Id<"categories">
    name: string
    slug: string
  } | null>(null)

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
  }

  const onSubmit = async () => {
    setError(null)
    setSuccess(null)

    if (!name.trim()) {
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
          name: name.trim(),
          slug: parsed.normalizedSlug,
          description: parsed.description,
          imageUrl: parsed.imageUrl,
          isActive,
          sortOrder: parsed.sortOrderNumber,
        })
        setSuccess(`Updated category: ${editingCategory.name}`)
        resetForm()
      } else {
        const id = await createCategory({
          name: name.trim(),
          slug: parsed.normalizedSlug,
          description: parsed.description,
          imageUrl: parsed.imageUrl,
          isActive,
          sortOrder: parsed.sortOrderNumber,
        })

        setSuccess(`Created category: ${String(id)}`)
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsSaving(false)
    }
  }

  const onDelete = async (id: Id<"categories">) => {
    setError(null)
    setSuccess(null)
    try {
      await removeCategory({ id })
      setSuccess("Category deleted")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const startEditing = (category: (typeof categories)[number]) => {
    setEditingCategory({ id: category._id, name: category.name })
    setName(category.name)
    setSlug(category.slug)
    setDescription(category.description ?? "")
    setImageUrl(category.imageUrl ?? "")
    setSortOrder(String(category.sortOrder))
    setIsActive(category.isActive)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-h2 font-serif font-semibold leading-tight text-[#002684]">
          Categories
        </h1>
        <p className="text-body leading-relaxed text-[#002684]/70">
          Create and manage store categories.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="rounded-2xl">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-h3 font-medium text-[#002684]">
            {editingCategory ? "Edit category" : "Create category"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-body font-medium text-[#002684]">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Holiday"
                className="h-12 min-h-[44px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="slug" className="text-body font-medium text-[#002684]">
                Slug
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="holiday"
                className="h-12 min-h-[44px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="description"
                className="text-body font-medium text-[#002684]"
              >
                Description (optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A festive collection of gift baskets."
                className="min-h-[96px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="imageUrl"
                className="text-body font-medium text-[#002684]"
              >
                Image URL (optional)
              </Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://.../category.jpg"
                className="h-12 min-h-[44px]"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="sortOrder"
                  className="text-body font-medium text-[#002684]"
                >
                  Sort order
                </Label>
                <Input
                  id="sortOrder"
                  inputMode="numeric"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="h-12 min-h-[44px]"
                />
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-body font-medium text-[#002684]">Active</p>
                    <p className="text-sm-fluid text-[#002684]/70">
                      Visible in the storefront.
                    </p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isSaving}
                className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90"
              >
                {isSaving ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Saving…
                  </span>
                ) : editingCategory ? (
                  "Save changes"
                ) : (
                  "Create category"
                )}
              </Button>

              {editingCategory ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={resetForm}
                  className="h-12 min-h-[44px] rounded-full px-6"
                >
                  Cancel editing
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-h3 font-medium text-[#002684]">
            Existing categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categories === undefined ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Spinner className="h-6 w-6 text-[#1d4ed8]" />
              <p className="text-body leading-relaxed text-[#002684]/70">Loading…</p>
            </div>
          ) : categories.length === 0 ? (
            <p className="text-body leading-relaxed text-[#002684]/70">
              No categories yet.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {categories.map((c) => (
                <div
                  key={String(c._id)}
                  className="flex flex-col gap-3 rounded-2xl border bg-white p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-h3 font-medium text-[#002684]">{c.name}</p>
                    <p className="text-sm-fluid text-[#002684]/70">/{c.slug}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-sm-fluid text-[#002684]/70">
                      Sort: {c.sortOrder} · {c.isActive ? "Active" : "Hidden"}
                    </p>
                    {c.description ? (
                      <p className="text-body leading-relaxed text-[#002684]/70">
                        {c.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => startEditing(c)}
                      className="h-12 min-h-[44px] rounded-full px-6"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCategoryToDelete({ id: c._id, name: c.name, slug: c.slug })}
                      className="h-12 min-h-[44px] rounded-full px-6"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <AlertDialog
            open={categoryToDelete !== null}
            onOpenChange={(isOpen) => {
              if (!isOpen) setCategoryToDelete(null)
            }}
          >
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-[#002684]">
                    {categoryToDelete ? categoryToDelete.name : "this category"}
                  </span>
                  {categoryToDelete ? ` (/${categoryToDelete.slug})` : ""}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <AlertDialogCancel className="h-12 min-h-[44px] rounded-full">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="h-12 min-h-[44px] rounded-full bg-red-600 text-white hover:bg-red-600/90"
                  onClick={() => {
                    if (!categoryToDelete) return
                    void onDelete(categoryToDelete.id).finally(() => {
                      setCategoryToDelete(null)
                    })
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
