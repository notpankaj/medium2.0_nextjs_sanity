import Head from 'next/head'
import Header from '../components/Header'
import { Post } from '../typings'
import { sanityClient, urlFor } from '../sanity'
import Link from 'next/link'

interface Props {
  posts: [Post]
}

export default function Home({ posts }: Props) {
  console.log({ posts })
  return (
    <div className="mx-auto max-w-7xl ">
      <Head>
        <title>Medium Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="flex items-center  justify-between border-y border-black bg-yellow-300 py-10 lg:py-0">
        <div className="space-y-5 px-10  ">
          <h1 className="max-w-xl font-serif text-6xl">
            <span className="decoration-depth-4 mr-4 underline decoration-black">
              Medium
            </span>
            is a place to write, read, and connect
          </h1>
          <h2>
            It's easy and face to post your thinking on any topic and connect
            with millions of readers.
          </h2>
        </div>
        <img
          className="hidden h-32 md:inline-flex lg:h-full "
          src="https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png"
          alt="logo"
        />
      </div>

      {/* Posts */}
      <div className="grid grid-cols-1 gap-6   p-2 sm:grid-cols-2  md:gap-6 lg:grid-cols-3 ">
        {posts.map((post) => (
          <Link key={post._id} href={`/post/${post.slug.current}`}>
            <div className="group  cursor-pointer overflow-hidden  rounded-lg border ">
              <div>
                <img
                  className="h-60 min-w-full object-cover transition-transform duration-200 ease-in-out group-hover:scale-105 "
                  src={`${urlFor(post.mainImage).url()!}`}
                />
              </div>
              <div className="flex justify-between bg-white p-5">
                <div>
                  <p className="text-lg font-bold">{post.title}</p>
                  <p className="text-xs">
                    {post.description} by {post.author.name}
                  </p>
                </div>
                <img
                  className="h-12 w-12 rounded-full"
                  src={`${urlFor(post.author.image).url()}`}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const getServerSideProps = async () => {
  const query = `*[_type == "post"]{
      _id,
      title,
      slug,
      mainImage,
      createdAt,
      description,
      author ->{
      name,
      image
    }
    }`

  const posts = await sanityClient.fetch(query)

  return {
    props: {
      posts,
    },
  }
}
