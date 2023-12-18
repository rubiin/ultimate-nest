import { Factory } from "@mikro-orm/seeder";
import { NewsLetter } from "@entities";

/* `NewsLetterFactory` is a factory that creates `NewsLetter` instances */
export class NewsLetterFactory extends Factory<NewsLetter> {
  model = NewsLetter;

  definition(): Partial<NewsLetter> {
    return {
      content: `  <div class="header">
<h1>Mastering JavaScript: Tips, Tricks, and Updates</h1>
</div>

<div class="content">
<h2>Feature Spotlight: Introducing ES2022</h2>
<p>Stay ahead of the curve with the latest features introduced in ECMAScript 2022. Discover the powerful new additions like pattern matching, class static initialization, and more.</p>

<h2>Useful JavaScript Tips</h2>
<ul>
<li>Improve code readability with arrow functions and template literals.</li>
<li>Make your code more modular using ES modules and import/export statements.</li>
<li>Explore the power of JavaScript frameworks like React and Angular for building dynamic web applications.</li>
<li>Optimize performance by utilizing the latest JavaScript optimization techniques and best practices.</li>
</ul>

<h2>Upcoming JavaScript Events</h2>
<p>Mark your calendars for these exciting JavaScript events:</p>
<ul>
<li><strong>JavaScript Summit 2023:</strong> Join us for a two-day conference on the latest trends and advancements in JavaScript development. Date: July 10-11, 2023.</li>
<li><strong>Node.js Conference:</strong> A must-attend event for Node.js enthusiasts. Explore the power of server-side JavaScript. Date: August 15-16, 2023.</li>
</ul>
</div>

<div class="footer">
<p>Thank you for subscribing to our JavaScript newsletter. For more updates, follow us on Twitter: <a href="https://twitter.com/example" target="_blank">@example</a></p>
</div>`,
    };
  }
}
