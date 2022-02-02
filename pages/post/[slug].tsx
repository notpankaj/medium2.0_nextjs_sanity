import React, { useState } from 'react'
import Header from '../../components/Header'
import { Post } from '../../typings'
import { sanityClient, urlFor } from '../../sanity'
import { GetStaticProps } from 'next'
import { useForm, SubmitHandler } from 'react-hook-form'
import PortableText from 'react-portable-text'

interface IFormInput {
  _id: string
  name: string
  email: string
  comment: string
}

interface Props {
  post: Post
}

const Post = ({ post }: Props) => {
  console.log(post)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>()

  const [submitted, setSubmitted] = useState(false)

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        setSubmitted(true)
      })
      .catch((err) => {
        setSubmitted(false)
        console.log(err)
      })
  }

  return (
    <main>
      <Header />
      <img
        className="h-40 w-full object-cover"
        src={urlFor(post.mainImage).url()!}
      />

      <article className="mx-auto max-w-3xl p-5">
        <h1 className="mt-10 mb-3 text-3xl">{post.title}</h1>
        <h2 className="mb-2 font-light  text-gray-500">{post.description}</h2>

        <div className="flex items-center space-x-4">
          <img
            className="h-10 w-10 rounded-full"
            src={urlFor(post.author.image).url()!}
            alt=""
          />
          <p className="text-sm font-extralight">
            Blog Post by{' '}
            <span className="text-green-600">{post.author.name}</span> -
            Published at
            {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-10">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="my-5 text-2xl font-bold" {...props} />
              ),
              h2: (props: any) => (
                <h2 className="my-5 text-xl font-bold" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc ">{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>

      <hr className="my-5 mx-auto max-w-lg border border-yellow-500" />

      {submitted ? (
        <div className="my-10 mx-auto flex max-w-2xl flex-col bg-yellow-400 p-10 text-white">
          <h3 className="text-3xl font-bold">
            Thank you for submmiting your comment !
          </h3>
          <p>Once it approved, it will appear below!</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="my-10 mx-auto mb-10 flex max-w-2xl flex-col p-5"
        >
          <h3 className="text-sm text-yellow-500">Enjoy this article?</h3>
          <h4 className="text-3xl font-bold">Leave a comment below!</h4>

          <hr className="mt-2 py-3" />
          <input
            type="hidden"
            {...register('_id')}
            name="_id"
            value={post._id}
          />

          <label htmlFor="" className="mb-5 block">
            <span className="text-gray-700">Name</span>
            <input
              {...register('name', { required: true })}
              className="form-input mt-1 block w-full rounded border py-2 px-3 shadow outline-none  ring-yellow-500 focus:ring "
              placeholder="Jhone Appleseed"
              type="text"
            />
          </label>
          <label htmlFor="" className="mb-5 block">
            <span className="text-gray-700">Email</span>
            <input
              {...register('email', { required: true })}
              className="form-input mt-1 block w-full rounded border py-2 px-3  shadow outline-none  ring-yellow-500 focus:ring "
              placeholder="Jhone Appleseed"
              type="text"
            />
          </label>
          <label htmlFor="" className="mb-5 block">
            <span className="text-gray-700">Comment</span>
            <textarea
              {...register('comment', { required: true })}
              className="from-textarea mt-1 block w-full  rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring "
              placeholder=""
              rows={8}
            />
          </label>

          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-500">The Name Field is required! </span>
            )}
            {errors.email && (
              <span className="text-red-500">
                The Email Field is required!{' '}
              </span>
            )}
            {errors.comment && (
              <span className="text-red-500">
                The Comment Field is required!
              </span>
            )}
          </div>
          <input
            type="submit"
            className="focus:shadow-outline foucus:outline-none cursor-pointer rounded bg-yellow-500 font-bold text-white shadow hover:bg-yellow-400"
          />
        </form>
      )}

      {/* comments */}
      <div className="my-10 mx-auto flex max-w-2xl flex-col  space-y-4 p-10 shadow shadow-yellow-500 ">
        <h3 className="text-4xl ">Comments</h3>
        <hr className="pb-2" />
        {post.comments.map((comment) => (
          <div className="">
            <p className="">
              <span className="text-yellow-500">{comment.name}: </span>
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
export default Post

export const getStaticPaths = async () => {
  const query = `
  *[_type == "post"]{
    _id,
    slug {
        current
    }
  }`

  const posts = await sanityClient.fetch(query)
  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))
  return { paths, fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    createdAt,
    title,
    author ->{
        name, 
        image
    },
    'comments': *[
        _type == "comment" &&
        post._ref  == ^._id &&
        Approved == true
    ],
    description,
    mainImage,
    slug,
    body
}`
  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  })

  if (!post) {
    return {
      notFound: true,
    }
  }
  return { props: { post }, revalidate: 60 }
}
