"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { Pencil, Trash2 } from "lucide-react"

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

type AdminProduct = {
  _id: Id<"products">
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  compareAtPrice?: number
  categoryId: Id<"categories">
  images: string[]
  isFeatured: boolean
  isActive: boolean
  inventory: number
  tags: string[]
  allowCustomNote: boolean
  metaTitle?: string
  metaDescription?: string
}

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

export default function AdminProductsPage() {
  const categories = useQuery(api.categories.listAll)
  const products = useQuery((api as any).products.listAllAdmin, {
    limit: 200,
  }) as AdminProduct[] | undefined
  const createProduct = useMutation(api.products.create)
  const updateProduct = useMutation(api.products.update)
  const removeProduct = useMutation(api.products.remove)
  const generateUploadUrl = useMutation((api as any).products.generateUploadUrl) as any
  const getUrlForStorageId = useMutation(
    (api as any).products.getUrlForStorageId
  ) as any

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [isSlugManual, setIsSlugManual] = useState(false)
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [priceDollars, setPriceDollars] = useState("")
  const [compareAtDollars, setCompareAtDollars] = useState("")
  const [inventory, setInventory] = useState("0")
  const [imagesCsv, setImagesCsv] = useState("")
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [tagsCsv, setTagsCsv] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [allowCustomNote, setAllowCustomNote] = useState(true)
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")

  const [editingId, setEditingId] = useState<Id<"products"> | null>(null)
  const [deleteId, setDeleteId] = useState<Id<"products"> | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!isSlugManual) setSlug(slugify(name))
  }, [isSlugManual, name])

  useEffect(() => {
    if (!categoryId && categories && categories.length > 0) {
      setCategoryId(String(categories[0]._id))
    }
  }, [categories, categoryId])

  const parsed = useMemo(() => {
    const imagesFromCsv = imagesCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const tags = tagsCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const price = Number.isFinite(Number(priceDollars))
      ? Math.round(Number(priceDollars) * 100)
      : NaN

    const compareAt = compareAtDollars.trim()
      ? Math.round(Number(compareAtDollars) * 100)
      : undefined

    const inventoryNumber = Number.isFinite(Number(inventory))
      ? Math.floor(Number(inventory))
      : NaN

    return { imagesFromCsv, tags, price, compareAt, inventoryNumber }
  }, [compareAtDollars, imagesCsv, inventory, priceDollars, tagsCsv])

  const combinedImages = useMemo(() => {
    const all = [...uploadedImageUrls, ...parsed.imagesFromCsv].filter(Boolean)
    return Array.from(new Set(all))
  }, [parsed.imagesFromCsv, uploadedImageUrls])

  const categoryById = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of categories ?? []) {
      map.set(String(c._id), c.name)
    }
    return map
  }, [categories])

  const resetForm = () => {
    setName("")
    setSlug("")
    setIsSlugManual(false)
    setShortDescription("")
    setDescription("")
    setCategoryId("")
    setPriceDollars("")
    setCompareAtDollars("")
    setInventory("0")
    setImagesCsv("")
    setUploadedImageUrls([])
    setImageUploadError(null)
    setTagsCsv("")
    setIsFeatured(false)
    setIsActive(true)
    setAllowCustomNote(true)
    setMetaTitle("")
    setMetaDescription("")
  }

  const startEditing = (product: AdminProduct) => {
    setError(null)
    setSuccess(null)

    const nextIsSlugManual = !(
      product.slug.length === 1 && slugify(product.name).length > 1
    )

    setEditingId(product._id)
    setName(product.name)
    setSlug(product.slug)
    setIsSlugManual(nextIsSlugManual)
    setShortDescription(product.shortDescription ?? "")
    setDescription(product.description)
    setCategoryId(String(product.categoryId))
    setPriceDollars((product.price / 100).toFixed(2))
    setCompareAtDollars(
      product.compareAtPrice ? (product.compareAtPrice / 100).toFixed(2) : ""
    )
    setInventory(String(product.inventory))
    setUploadedImageUrls(product.images)
    setImagesCsv("")
    setTagsCsv(product.tags.join(", "))
    setIsFeatured(product.isFeatured)
    setIsActive(product.isActive)
    setAllowCustomNote(product.allowCustomNote)
    setMetaTitle(product.metaTitle ?? "")
    setMetaDescription(product.metaDescription ?? "")
  }

  const cancelEditing = () => {
    setEditingId(null)
    resetForm()
  }

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return
    setImageUploadError(null)

    const imageFiles = files.filter((f) => f.type.startsWith("image/"))
    if (imageFiles.length === 0) {
      setImageUploadError("Please upload image files only")
      return
    }

    try {
      setIsUploadingImages(true)

      for (const file of imageFiles) {
        const postUrl: string = await generateUploadUrl()
        const result = await fetch(postUrl, {
          method: "POST",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        })

        if (!result.ok) {
          throw new Error(`Upload failed (${result.status})`)
        }

        const json = (await result.json()) as { storageId: Id<"_storage"> }
        const url: string | null = await getUrlForStorageId({
          storageId: json.storageId,
        })

        if (!url) {
          throw new Error("Could not resolve uploaded file URL")
        }

        setUploadedImageUrls((prev) => Array.from(new Set([...prev, url])))
      }
    } catch (err) {
      setImageUploadError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsUploadingImages(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const onSave = async () => {
    setError(null)
    setSuccess(null)

    if (!name.trim()) {
      setError("Name is required")
      return
    }

    const normalizedSlug = slugify(slug)
    if (!normalizedSlug) {
      setError("Slug is required")
      return
    }

    if (!description.trim()) {
      setError("Description is required")
      return
    }

    if (!categoryId) {
      setError("Category is required")
      return
    }

    if (!Number.isFinite(parsed.price) || parsed.price <= 0) {
      setError("Price must be a number greater than 0")
      return
    }

    if (!Number.isFinite(parsed.inventoryNumber) || parsed.inventoryNumber < 0) {
      setError("Inventory must be 0 or greater")
      return
    }

    if (combinedImages.length === 0) {
      setError("Add at least one image (upload a file or paste an image URL)")
      return
    }

    try {
      setIsSaving(true)
      if (editingId) {
        await updateProduct({
          id: editingId,
          name: name.trim(),
          slug: normalizedSlug,
          description: description.trim(),
          shortDescription: shortDescription.trim()
            ? shortDescription.trim()
            : undefined,
          price: parsed.price,
          compareAtPrice: parsed.compareAt,
          categoryId: categoryId as Id<"categories">,
          images: combinedImages,
          isFeatured,
          isActive,
          inventory: parsed.inventoryNumber,
          tags: parsed.tags,
          allowCustomNote,
          metaTitle: metaTitle.trim() ? metaTitle.trim() : undefined,
          metaDescription: metaDescription.trim() ? metaDescription.trim() : undefined,
        })
        setSuccess(`Updated product: ${String(editingId)}`)
        setEditingId(null)
        resetForm()
      } else {
        const id = await createProduct({
          name: name.trim(),
          slug: normalizedSlug,
          description: description.trim(),
          shortDescription: shortDescription.trim()
            ? shortDescription.trim()
            : undefined,
          price: parsed.price,
          compareAtPrice: parsed.compareAt,
          categoryId: categoryId as Id<"categories">,
          images: combinedImages,
          isFeatured,
          isActive,
          inventory: parsed.inventoryNumber,
          tags: parsed.tags,
          allowCustomNote,
          metaTitle: metaTitle.trim() ? metaTitle.trim() : undefined,
          metaDescription: metaDescription.trim() ? metaDescription.trim() : undefined,
        })
        setSuccess(`Created product: ${String(id)}`)
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsSaving(false)
    }
  }

  const onDelete = async (id: Id<"products">) => {
    setError(null)
    setSuccess(null)
    try {
      setDeleteId(id)
      await removeProduct({ id })
      setSuccess("Product deleted")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-h2 font-serif font-semibold leading-tight text-[#002684]">
          Products
        </h1>
        <p className="text-body leading-relaxed text-[#002684]/70">
          Create a new product and publish it to the store.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertTitle>Could not save</AlertTitle>
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
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="text-h3 font-medium text-[#002684]">
            Existing products
          </CardTitle>
          <p className="text-body leading-relaxed text-[#002684]/70">
            Edit or remove products that are already in your store.
          </p>
        </CardHeader>
        <CardContent>
          {products === undefined ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Spinner className="h-6 w-6 text-[#1d4ed8]" />
              <p className="text-body leading-relaxed text-[#002684]/70">
                Loading products…
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col gap-2 rounded-2xl border bg-white p-4">
              <p className="text-body font-medium text-[#002684]">No products yet</p>
              <p className="text-body leading-relaxed text-[#002684]/70">
                Create your first product below.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[520px] pr-2">
              <div className="flex flex-col gap-4">
                {products.map((p) => {
                  const categoryName = categoryById.get(String(p.categoryId))
                  const image = p.images?.[0]
                  return (
                    <div
                      key={String(p._id)}
                      className="flex flex-col gap-4 rounded-2xl border bg-white p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start">
                          {image ? (
                            <img
                              src={image}
                              alt={p.name}
                              className="w-full h-auto object-cover rounded-xl border md:w-24"
                            />
                          ) : null}

                          <div className="flex flex-col gap-1">
                            <p className="text-body font-semibold text-[#002684]">
                              {p.name}
                            </p>
                            <p className="text-sm-fluid text-[#002684]/70">/{p.slug}</p>
                            <p className="text-sm-fluid text-[#002684]/70">
                              {formatCents(p.price)}
                              {Number.isFinite(p.inventory)
                                ? ` • Inventory: ${p.inventory}`
                                : ""}
                            </p>
                            {categoryName ? (
                              <p className="text-sm-fluid text-[#002684]/70">
                                Category: {categoryName}
                              </p>
                            ) : null}

                            <div className="flex flex-wrap gap-2 pt-2">
                              <span className="rounded-full border bg-white px-3 py-1 text-sm-fluid text-[#002684]">
                                {p.isActive ? "Active" : "Inactive"}
                              </span>
                              {p.isFeatured ? (
                                <span className="rounded-full border bg-white px-3 py-1 text-sm-fluid text-[#002684]">
                                  Featured
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => startEditing(p)}
                            className="h-12 min-h-[44px] rounded-full px-6"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </span>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="destructive"
                                className="h-12 min-h-[44px] rounded-full px-6"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete product?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the product from the store. Any cart items
                                  containing it will also be removed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="h-12 min-h-[44px] rounded-full">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => void onDelete(p._id)}
                                  className="h-12 min-h-[44px] rounded-full bg-destructive text-white hover:bg-destructive/90"
                                >
                                  {deleteId === p._id ? "Deleting…" : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-h3 font-medium text-[#002684]">
            {editingId ? "Edit product" : "Create product"}
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
                placeholder="Holiday Deluxe Gift Basket"
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
                onChange={(e) => {
                  const next = e.target.value
                  setSlug(next)
                  setIsSlugManual(next.trim().length > 0)
                }}
                placeholder="holiday-deluxe-gift-basket"
                className="h-12 min-h-[44px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="shortDescription"
                className="text-body font-medium text-[#002684]"
              >
                Short description (optional)
              </Label>
              <Textarea
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A premium basket packed with favorites."
                className="min-h-[96px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="description"
                className="text-body font-medium text-[#002684]"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full product description…"
                className="min-h-[140px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-body font-medium text-[#002684]">Category</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
                <SelectTrigger className="h-12 min-h-[44px]">
                  <SelectValue
                    placeholder={categories ? "Select a category" : "Loading categories…"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories ? (
                    categories.map((c) => (
                      <SelectItem key={String(c._id)} value={String(c._id)}>
                        {c.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Loading…
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="price" className="text-body font-medium text-[#002684]">
                  Price (USD)
                </Label>
                <Input
                  id="price"
                  inputMode="decimal"
                  value={priceDollars}
                  onChange={(e) => setPriceDollars(e.target.value)}
                  placeholder="49.99"
                  className="h-12 min-h-[44px]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="compareAt"
                  className="text-body font-medium text-[#002684]"
                >
                  Compare-at (optional)
                </Label>
                <Input
                  id="compareAt"
                  inputMode="decimal"
                  value={compareAtDollars}
                  onChange={(e) => setCompareAtDollars(e.target.value)}
                  placeholder="59.99"
                  className="h-12 min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="inventory"
                className="text-body font-medium text-[#002684]"
              >
                Inventory
              </Label>
              <Input
                id="inventory"
                inputMode="numeric"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                className="h-12 min-h-[44px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="images"
                className="text-body font-medium text-[#002684]"
              >
                Images
              </Label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])
                  void uploadFiles(files)
                }}
              />

              <div
                className={
                  "flex flex-col gap-3 rounded-2xl border bg-white p-4 transition-colors " +
                  (isDragActive ? "border-[#1d4ed8] bg-[#1d4ed8]/5" : "")
                }
                onDragEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragActive(true)
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragActive(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragActive(false)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragActive(false)
                  const files = Array.from(e.dataTransfer.files ?? [])
                  void uploadFiles(files)
                }}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-body leading-relaxed text-[#002684]">
                    Drag & drop images here, or choose files
                  </p>
                  <p className="text-sm-fluid text-[#002684]/70">
                    You can also paste image URLs below.
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImages}
                    className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90"
                  >
                    {isUploadingImages ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="h-4 w-4" />
                        Uploading…
                      </span>
                    ) : (
                      "Choose files"
                    )}
                  </Button>

                  {uploadedImageUrls.length > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUploadedImageUrls([])}
                      className="h-12 min-h-[44px] rounded-full px-6"
                    >
                      Clear uploads
                    </Button>
                  ) : null}
                </div>

                {imageUploadError ? (
                  <p className="text-sm-fluid text-destructive">{imageUploadError}</p>
                ) : null}

                {uploadedImageUrls.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {uploadedImageUrls.map((url) => (
                      <div
                        key={url}
                        className="flex flex-col gap-2 rounded-xl border bg-white p-2"
                      >
                        <img
                          src={url}
                          alt="Uploaded"
                          className="w-full h-auto object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setUploadedImageUrls((prev) => prev.filter((u) => u !== url))
                          }
                          className="h-12 min-h-[44px] rounded-full"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}

              </div>

              <Textarea
                id="images"
                value={imagesCsv}
                onChange={(e) => setImagesCsv(e.target.value)}
                placeholder="https://.../image1.jpg, https://.../image2.jpg"
                className="min-h-[96px]"
              />

              <p className="text-sm-fluid text-[#002684]/70">
                Total images attached: {combinedImages.length}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tags" className="text-body font-medium text-[#002684]">
                Tags (comma-separated)
              </Label>
              <Input
                id="tags"
                value={tagsCsv}
                onChange={(e) => setTagsCsv(e.target.value)}
                placeholder="holiday, chocolate, premium"
                className="h-12 min-h-[44px]"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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

              <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-body font-medium text-[#002684]">Featured</p>
                    <p className="text-sm-fluid text-[#002684]/70">
                      Highlight this product.
                    </p>
                  </div>
                  <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-body font-medium text-[#002684]">Allow custom note</p>
                  <p className="text-sm-fluid text-[#002684]/70">
                    Let customers add a message.
                  </p>
                </div>
                <Switch
                  checked={allowCustomNote}
                  onCheckedChange={setAllowCustomNote}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="metaTitle"
                className="text-body font-medium text-[#002684]"
              >
                Meta title (optional)
              </Label>
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="h-12 min-h-[44px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="metaDescription"
                className="text-body font-medium text-[#002684]"
              >
                Meta description (optional)
              </Label>
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="min-h-[96px]"
              />
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90"
              >
                {isSaving ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Saving…
                  </span>
                ) : editingId ? (
                  "Save changes"
                ) : (
                  "Create product"
                )}
              </Button>

              {editingId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEditing}
                  className="h-12 min-h-[44px] rounded-full px-6"
                >
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
